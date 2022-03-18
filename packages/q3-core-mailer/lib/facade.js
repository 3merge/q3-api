const caller = require('caller');
const { compact, get } = require('lodash');
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
  s = caller(),
) => cleanCallerResponse(s);

async function MailerCoreFacade(
  user,
  context,
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

    await inst.fromDatabase({
      context,
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
