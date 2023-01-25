const Mailer = require('q3-core-mailer');
const {
  get,
  map,
  pick,
  isObject,
  isString,
  isNil,
} = require('lodash');
const i18next = require('i18next');
const Pipeline = require('./pipeline');
const { castId, getId } = require('./utils');

module.exports = function NotifyDependencyLayer(
  Models = {},
) {
  if (
    !('Domains' in Models) ||
    !('Notifications' in Models)
  )
    throw new Error(
      'Configuration object requires the Q3 Domain and Notification models',
    );

  const hasArrayLength = (xs) =>
    Array.isArray(xs) && xs.length > 0;

  const hasIn = (xs, comparisonValue) =>
    !isNil(xs.find((item) => item === comparisonValue));

  const someIncludes = (xs, char) =>
    xs.some((item) => String(item).includes(char));

  class NotifyCommander {
    constructor(notificationObject = {}, options = {}) {
      this.$meta = pick(notificationObject, [
        'documentId',
        'documentAuthor',
        'subDocumentId',
        'subDocumentAuthor',
        'messageType',
        'userId',
        'attachment',
      ]);

      this.$context = get(
        notificationObject,
        'context',
        {},
      );

      this.$exemptUserId = false;
      this.$listener = Mailer.Facade.interpretTemplateName(
        get(options, 'filename'),
      );

      this.$users = [];
      this.$withOwnership = get(
        options,
        'withOwnership',
        false,
      );

      this.$webAppPathMaker = get(
        options,
        'webAppPathMaker',
        process.env.WEB_APP_PATH_MAKER,
      );
    }

    exemptUserId() {
      this.$exemptUserId = Boolean(this.$meta.userId);
      return this;
    }

    getInAppLink() {
      const variables = [
        'messageType',
        'documentId',
        'subDocumentId',
      ];

      let str =
        this.$webAppPathMaker ||
        '/app/:messageType/:documentId';

      if (isString(str) && isObject(this.$meta)) {
        variables.forEach((v) => {
          str = str.replace(`:${v}`, get(this.$meta, v));
        });

        // indicates the link will be broken
        return str.includes('undefined') ? null : str;
      }

      return null;
    }

    negateId(query) {
      if (this.$exemptUserId) {
        const ne = {
          $ne: getId(this.$meta.userId),
        };

        if (isObject(query)) {
          if (query._id) {
            if (query.$and) {
              query.$and.push(ne);
            } else {
              // eslint-disable-next-line
              query.$and = [ne];
            }
          } else {
            // eslint-disable-next-line
            query._id = ne;
          }
        } else {
          return {
            _id: ne,
          };
        }
      }

      return query;
    }

    concatOwnershipTextForUser(user = {}) {
      let l = this.$listener;

      const joinWithL = (str) => {
        l = [l].concat(str).join('');
      };

      if (this.$withOwnership) {
        if (user.isDocumentMine) joinWithL('MyDoc');
        if (user.isSubDocumentMine) joinWithL('MySubDoc');
      }

      return l;
    }

    isUserEqualTo(user = {}) {
      return (key) => {
        const id = get(this.$meta, key);
        const userId = user._id;

        try {
          return userId.equals(id);
        } catch (e) {
          return userId === id;
        }
      };
    }

    translateForUser(user = {}) {
      return (ns) => {
        const t = i18next.getFixedT(user.lang || 'en');
        const k = this.concatOwnershipTextForUser(user);
        const out = t(`${ns}:${k}`, this.$context);

        if (out === k && k !== this.$listener)
          return t(
            `${ns}:${this.$listener}`,
            this.$context,
          );

        return out;
      };
    }

    async loadUsers(query) {
      this.$users = await Pipeline(
        Models.Domains,
        this.$listener,
        this.negateId(castId(query)),
      );

      return this;
    }

    async forEachUserAsync(cb, subscriptionMethod = null) {
      return Promise.all(
        map(this.$users, (user) => {
          if (
            subscriptionMethod &&
            // exclude them for this delivery method
            !this.wantsBy(user, subscriptionMethod)
          )
            return null;

          if (this.$withOwnership) {
            const fn = this.isUserEqualTo(user);

            // eslint-disable-next-line
            user.isDocumentMine = fn('documentAuthor');
            // eslint-disable-next-line
            user.isSubDocumentMine = fn(
              'subDocumentAuthor',
            );
          }

          return cb(user);
        }),
      );
    }

    wantsBy(xs, method) {
      const l = get(xs, 'listens', []);
      const char = '__';
      const variantStr = [
        this.$listener,
        char,
        method,
      ].join('');

      return (
        // if no length then noop
        hasArrayLength(l) &&
        // if no char, then does the listener exist?
        // if char, then does the listener variant exist?
        ((!someIncludes(l, char) &&
          hasIn(l, this.$listener)) ||
          hasIn(l, variantStr))
      );
    }

    async notify() {
      return this.forEachUserAsync(async (user) => {
        const t = this.translateForUser(user);

        return Models.Notifications.create({
          ...this.$meta,
          read: false,
          archived: false,
          active: true,
          label: t('messages'),
          excerpt: t('descriptions'),
          localUrl: this.getInAppLink(),
          userId: user._id,
        });
      }, 'native');
    }

    async send() {
      const body = {
        ...this.$meta,
        context: this.$context,
      };

      return this.forEachUserAsync(
        async (user) =>
          // look at the constructor and this.$listener
          // just implements what Facade would normally automatically
          // but it extends the name to other external methods in this class
          Mailer.Facade(user, body, this.$listener),
        'email',
      );
    }
  }

  return (...constructorOptions) =>
    new NotifyCommander(...constructorOptions);
};
