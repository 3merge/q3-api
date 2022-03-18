const caller = require('caller');
const { compact, get, isObject } = require('lodash');
const Core = require('./core');
const {
  cleanCallerResponse,
  convertFromCamelCase,
  getWebAppUrlAsTenantUser,
  langCode,
} = require('./utils');

/**
 * @NOTE
 * The idea here is that Q3 usually calls MailerCode
 * from the /chores directory, where the initial file name
 * actually corresponds to the email template.
 */
const interpretTemplateNameFromInitialCallerFunction = (
  str,
) => {
  const primary = caller();
  const secondary = caller(2);

  // eslint-disable-next-line
  const s = str
    ? str
    : primary === secondary ||
      String(secondary).includes('node_modules')
    ? primary
    : secondary;

  return cleanCallerResponse(s);
};

async function MailerCoreFacade(
  user,
  options,
  overrideTemplateName,
) {
  try {
    const lang = langCode(get(user, 'lang', 'en'));
    const template = convertFromCamelCase(
      overrideTemplateName ||
        interpretTemplateNameFromInitialCallerFunction(),
    );

    const localizedTemplateName = compact([
      lang,
      template,
    ]).join('-');

    const url = getWebAppUrlAsTenantUser(user);
    const inst = new Core(localizedTemplateName).to([
      get(user, 'email'),
    ]);

    if (!isObject(options) || !('context' in options))
      // eslint-disable-next-line
      console.warn('Missing context in mailer options');

    await inst.fromDatabase({
      ...options,
      user,
      url,
    });

    return inst.send();
  } catch (e) {
    throw new Error('Failed to send: ', e);
  }
}

MailerCoreFacade.interpretTemplateName =
  interpretTemplateNameFromInitialCallerFunction;

module.exports = MailerCoreFacade;
