const i18next = require('i18next');
const fs = require('fs');
const path = require('path');

const walker = (src) => {
  const dir = path.join(src, 'locale');

  fs.readdirSync(dir).forEach((lang) => {
    const folder = path.join(dir, lang);
    fs.readdirSync(folder).forEach((ns) => {
      const { name } = path.parse(ns);
      const json = fs.readFileSync(
        `${folder}/${ns}`,
        'utf8',
      );

      i18next.addResources(lang, name, JSON.parse(json));
    });
  });
};

i18next.init({
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

walker(path.resolve(__dirname, '../..'));

i18next.walker = walker;
module.exports = i18next;
