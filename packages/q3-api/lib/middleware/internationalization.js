const { get } = require('lodash');
const ctx = require('request-context');
const i18Base = require('../config/i18next');

const queryLang = (lang) => {
  return lang ? lang.split('-')[0] : null;
};

module.exports = async (req, res, next) => {
  const i18n = i18Base.cloneInstance({
    lng: queryLang(get(req, 'query.lang')),
  });

  ctx.set('q3-session:locale', i18n);
  req.i18n = i18n;

  req.tChange = (lang) =>
    i18n.changeLanguage(queryLang(lang));

  req.t = (msg, variables) => i18n.t(msg, variables);

  req.dirty = (msg, variables) =>
    i18n.t(`validations:${msg}`, variables);

  req.clean = (msg, variables) =>
    i18n.t(`messages:${msg}`, variables);

  // the following methods are namespace aliases
  req.t.val = (msg, variables) =>
    i18n.t(`validations:${msg}`, variables);

  req.t.msg = (msg, variables) =>
    i18n.t(`messages:${msg}`, variables);

  req.t.err = (msg, variables) =>
    i18n.t(`errors:${msg}`, variables);

  next();
};
