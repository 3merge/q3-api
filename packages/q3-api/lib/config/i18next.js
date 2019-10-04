const i18next = require('i18next');
const sprintf = require('i18next-sprintf-postprocessor');
const FsBackend = require('i18next-node-fs-backend');
const path = require('path');

i18next
  .use(sprintf)
  .use(FsBackend)
  .init({
    lng: 'en',
    fallbackLng: 'en',
    keySeparator: false,
    interpolation: {
      escapeValue: false,
    },
    backend: {
      loadPath: path.join(
        __dirname,
        '../../locales/{{lng}}/{{ns}}.json',
      ),
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

module.exports = {
  translate,
  t: translate,
  loadTranslation,
  $inst: i18next,
};
