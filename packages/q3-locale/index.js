const fs = require('fs');
const path = require('path');
const i18next = require('i18next');
const middleware = require('i18next-http-middleware');

const walk = (dir) => {
  const root = path.join(dir, './lang');

  fs.readdirSync(root).forEach((lang) => {
    const folder = path.join(root, lang);
    fs.readdirSync(folder).forEach((ns) => {
      const { name } = path.parse(ns);
      const json = fs.readFileSync(
        `${folder}/${ns}`,
        'utf8',
      );

      i18next.addResourceBundle(
        lang,
        name,
        JSON.parse(json),
        true,
        true,
      );
    });
  });
};

i18next.use(middleware.LanguageDetector).init({
  compatibilityJSON: 'v3',
  lng: 'en',
  fallbackLng: 'en',
  preload: ['en', 'fr'],
  ns: ['messages', 'errors', 'validations', 'labels'],
  keySeparator: false,
  saveMissing: true,
  interpolation: {
    escapeValue: false,
  },
});

walk(__dirname);
module.exports = walk;
