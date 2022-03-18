const Mailer = require('q3-core-mailer');
const { get, map, pick, isObject } = require('lodash');
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

  class NotifyCommander {
    constructor(notificationObject = {}, options = {}) {
      this.$meta = pick(notificationObject, [
        'documentId',
        'documentAuthor',
        'subDocumentId',
        'subDocumentAuthor',
        'messageType',
        'userId',
      ]);

      this.$context = get(
        notificationObject,
        'context',
        {},
      );

      this.$exemptUserId = false;
      this.$listener = get(
        options,
        'filename',
        Mailer.Facade.interpretTemplateName(),
      );

      this.$users = [];
      this.$withOwnership = get(
        options,
        'withOwnership',
        false,
      );
    }

    exemptUserId() {
      this.$exemptUserId = Boolean(this.$meta.userId);
      return this;
    }

    getInAppLink() {
      const s =
        process.env.WEB_APP_PATH_MAKER ||
        '/app/:messageType/:documentId';

      if (
        get(this.$meta, 'messageType') &&
        get(this.$meta, 'documentId')
      )
        return String(s)
          .replace(':messageType', this.$meta.messageType)
          .replace(':documentId', this.$meta.documentId);

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

    async forEachUserAsync(cb) {
      return Promise.all(
        map(this.$users, (user) => {
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

    async notify() {
      return this.forEachUserAsync(async (user) => {
        const t = this.translateForUser(user);

        return Models.Notifications.create({
          ...this.$meta,
          hasSeen: false,
          label: t('messages'),
          excerpt: t('descriptions'),
          localUrl: this.getInAppLink(),
          userId: user._id,
        });
      });
    }

    async send() {
      return this.forEachUserAsync(async (user) =>
        // look at the constructor and this.$listener
        // just implements what Facade would normally automatically
        // but it extends the name to other external methods in this class
        Mailer.Facade(user, this.$context, this.$listener),
      );
    }
  }

  return (...constructorOptions) =>
    new NotifyCommander(...constructorOptions);
};
