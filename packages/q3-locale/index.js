const fs = require('fs');
const path = require('path');
const i18next = require('i18next');

const dir = path.join(__dirname, 'lang');

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

fs.readdirSync(dir).forEach((lang) => {
  const folder = path.join(dir, lang);
  fs.readdirSync(folder).forEach((ns) => {
    const { name } = path.parse(ns);
    const json = fs.readFileSync(`${folder}/${ns}`, 'utf8');

    if (ns.includes('handlebars')) {
      i18next.addResources(lang, 'emails', {
        [name]: json,
      });
    } else {
      i18next.addResources(lang, name, JSON.parse(json));
    }
  });
});
