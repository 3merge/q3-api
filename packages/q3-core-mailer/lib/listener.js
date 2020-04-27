const { exectuteOnAsync } = require('q3-schema-utils');
const MailerCore = require('./core');

const langCode = (v) =>
  typeof v === 'string'
    ? v.toLowerCase().split('-')[0]
    : 'en';

const isFn = (v) => typeof v === 'function';

const runAsFn = (v, args) => (isFn(v) ? v(args) : v);

const getTemplate = (lang, eventName, templateName) =>
  `${langCode(lang)}-${templateName || eventName}`;

const appendFilterFnToUserModel = (promise, filterFn) =>
  promise
    .select('role email firstName lastName lang __t')
    .lean()
    .then((res) =>
      isFn(filterFn) ? res.filter(filterFn) : res,
    );

const reduceListenersByLang = (users = [], getUrl) =>
  users.reduce((acc, user) => {
    const l = langCode(user.lang);
    if (!acc[l]) acc[l] = [];

    acc[l].push({
      url: runAsFn(getUrl, user.role),
      to: user.email,
      ...user,
    });

    return acc;
  }, {});

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
      MailerCore(getTemplate(lang, eventName, templateName))
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
