const Mailer = require('q3-core-mailer');
const { get, map, pick, isObject } = require('lodash');
const i18next = require('i18next');
const Pipeline = require('./pipeline');
const {
  castId,
  getWebAppUrlAsTenantUser,
  stripFileName,
  getTargetListener,
} = require('./utils');

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
      this.$listener = stripFileName(
        get(options, 'filename', getTargetListener()),
      );

      this.$users = [];
      this.$withOwnership = get(
        options,
        'withOwnership',
        false,
      );
    }

    static castId(v) {
      return castId(v);
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

    makeEmailTemplateNameFromUser(user = {}) {
      return `${user.lang || 'en'}-${String(this.$listener)
        .match(/[A-Z][a-z]+/g)
        .join('-')}`.toLowerCase();
    }

    negateId(query) {
      if (this.$exemptUserId) {
        const ne = {
          $ne: this.constructor.castId(this.$meta.userId),
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

    concatOwnershipText(
      initialWord,
      user = {},
      character = '',
    ) {
      let l = initialWord;

      const joinWithL = (str) => {
        l = [l].concat(str).join(character);
      };

      if (this.$withOwnership) {
        if (user.isDocumentMine) joinWithL('MyDoc');
        if (user.isSubDocumentMine) joinWithL('MySubDoc');
      }

      return l;
    }

    async loadUsers(query) {
      const formattedQuery = this.negateId(
        this.constructor.castId(query),
      );

      this.$users = await Pipeline(
        Models.Domains,
        this.$listener,
        formattedQuery,
      );

      return this;
    }

    async forEachUserAsync(cb) {
      return Promise.all(
        map(this.$users, (user) => {
          const isEqualTo = (key) => {
            const id = get(this.$meta, key);
            try {
              return user._id.equals(id);
            } catch (e) {
              return user._id === id;
            }
          };

          if (this.$withOwnership) {
            // eslint-disable-next-line
            user.isDocumentMine = isEqualTo(
              'documentAuthor',
            );
            // eslint-disable-next-line
            user.isSubDocumentMine = isEqualTo(
              'subDocumentAuthor',
            );
          }

          return cb(user);
        }),
      );
    }

    async notify() {
      return this.forEachUserAsync(async (user) => {
        const callT = (ns) => {
          const t = i18next.getFixedT(user.lang);
          const k = this.concatOwnershipText(
            this.$listener,
            user,
          );

          const out = t(`${ns}:${k}`, this.$context);

          if (out === k && k !== this.$listener)
            return t(
              `${ns}:${this.$listener}`,
              this.$context,
            );

          return out;
        };

        const notificationOptions = {
          ...this.$meta,
          hasSeen: false,
          label: callT('messages'),
          excerpt: callT('descriptions'),
          localUrl: this.getInAppLink(),
          userId: user._id,
        };

        return Models.Notifications.create(
          notificationOptions,
        );
      });
    }

    async send() {
      return this.forEachUserAsync(async (user) => {
        const templateName =
          this.makeEmailTemplateNameFromUser(user);

        const url = getWebAppUrlAsTenantUser(user);
        const mail = Mailer(templateName).to([user.email]);

        await mail.fromDatabase({
          context: this.$context,
          user,
          url,
        });

        return mail.send();
      });
    }
  }

  return (...constructorOptions) =>
    new NotifyCommander(...constructorOptions);
};
