const MailerCore = require('./core');

const langCode = (v) =>
  typeof v === 'string'
    ? v.toLowerCase().split('-')[0]
    : 'en';

const runAsFn = (v, args) =>
  typeof v === 'function' ? v(args) : v;

const getTemplate = (lang, templateName) =>
  `${langCode(lang)}-${templateName}`;

/**
 * @NOTE
 * Intended to work within q3-schema-users.
 * We are not deliberately referencing, though, for two reasons:
 * (1) Not all apps need this feature so we don't want to further bloat the UserModel.
 * (2) Some apps will have non-q3 user schemas, at which point only a few fields need to be mapped.
 */
module.exports = (UserModel, url, subjects) => async (
  eventName,
  filterFn,
  templateName,
) => {
  const users = await UserModel.find({
    listens: eventName,
    verified: true,
    active: true,
  })
    .select('role email firstName lastName lang __t')
    .lean()
    .exec();

  const listeners = await users
    .filter((user) => runAsFn(filterFn, user))
    .reduce((acc, user) => {
      const l = langCode(user.lang);
      if (!acc[l]) acc[l] = [];

      acc[l].push({
        url: runAsFn(url, user.role),
        to: user.email,
        ...user,
      });

      return acc;
    }, {});

  const entries = Object.entries(listeners);

  return (context) => {
    const sender = (lang, user) =>
      MailerCore(
        getTemplate(lang, templateName || eventName),
      )
        .to([user.to])
        .subject(subjects[eventName][lang])
        .props({
          ...context,
          ...user,
        })
        .send();

    const messages = entries.map(async ([lang, to]) => {
      Promise.all(to.map((user) => sender(lang, user)));
    });

    return Promise.all(messages);
  };
};
