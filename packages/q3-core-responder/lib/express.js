const ctx = require('request-context');
const i18Base = require('./i18n');

// lookup query
// lookup cookie
// lookup header

const queryLang = (lang) =>
  lang ? lang.split('-')[0] : null;

module.exports = (req, res, next) => {
  const i18n = i18Base.cloneInstance({
    lng: queryLang(req.query.lang),
  });

  req.i18n = i18n;
  ctx.set('q3-session:locale', i18n);

  req.t = (msg, variables) => i18n.t(msg, variables);

  req.tChange = (lang) =>
    i18n.changeLanguage(queryLang(lang));

  next();
};
