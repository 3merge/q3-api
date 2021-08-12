const { exectuteOnAsync } = require('q3-schema-utils');
const MailerCore = require('./core');
const {
  appendFilterFnToUserModel,
  reduceListenersByLang,
  getTemplate,
} = require('./utils');

/**
 * @NOTE
 * Intended to work within q3-schema-users.
 * We are not deliberately referencing, though, for two reasons:
 * (1) Not all apps need this feature so we don't want to further bloat the UserModel.
 * (2) Some apps will have non-q3 user schemas, at which point only a few fields need to be mapped.
 */
module.exports =
  (UserModel, url, subjects) =>
  async (eventName, filterFn, templateName) => {
    const listeners = await reduceListenersByLang(
      await appendFilterFnToUserModel(
        UserModel.find({
          listens: eventName,
          verified: true,
          active: true,
        }),
        filterFn,
      ),
      url,
    );

    return (context) => {
      const sender = (lang, user) =>
        MailerCore(
          getTemplate(lang, eventName, templateName),
        )
          .to([user.to])
          .subject(subjects[eventName][lang])
          .props({
            ...context,
            ...user,
          })
          .send();

      return exectuteOnAsync(
        Object.entries(listeners),
        async ([lang, to]) =>
          exectuteOnAsync(to, async (user) =>
            sender(lang, user),
          ),
      );
    };
  };
