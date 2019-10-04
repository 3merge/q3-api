const i18next = require('i18next');
const sprintf = require('i18next-sprintf-postprocessor');
const validationsEN = require('../../locale/en/validations.json');
const messagesEN = require('../../locale/en/messages.json');
const messagesFR = require('../../locale/fr/messages.json');
const validationsFR = require('../../locale/fr/validations.json');

i18next.use(sprintf).init({
  lng: 'en',
  fallbackLng: 'en',
  keySeparator: false,
  interpolation: {
    escapeValue: false,
  },
});

const loadTranslation = (lang, ns, json) =>
  i18next.addResources(lang, ns, json);

const translate = (msg, variables) =>
  i18next.t(
    msg,
    Array.isArray(variables)
      ? {
          postProcess: 'sprintf',
          sprintf: variables,
        }
      : null,
  );

loadTranslation('en', 'messages', messagesEN);
loadTranslation('fr', 'messages', messagesFR);
loadTranslation('en', 'validations', validationsEN);
loadTranslation('fr', 'validations', validationsFR);

module.exports = {
  translate,
  t: translate,
  loadTranslation,
};
