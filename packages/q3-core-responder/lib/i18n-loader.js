const fs = require('fs');
const path = require('path');
const i18next = require('./i18n');

module.exports = (src) => {
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
