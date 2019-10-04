const i18next = require('i18next');
const sprintf = require('i18next-sprintf-postprocessor');

i18next.use(sprintf).init({
  lng: 'en',
  fallbackLng: 'en',
  keySeparator: false,
  interpolation: {
    escapeValue: false,
  },
});

const translate = (msg, variables) => {
  let args = null;
  if (Array.isArray(variables))
    args = {
      postProcess: 'sprintf',
      sprintf: variables,
    };

  return i18next.t(msg, args);
};

module.exports = {
  translate,
  t: translate,
  loadTranslation(lang, ns, json) {
    i18next.addResources(lang, ns, json);
  },
};
