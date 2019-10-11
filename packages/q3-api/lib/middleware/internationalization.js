const { get } = require('lodash');
const ctx = require('request-context');
const { $inst } = require('../config/i18next');

const queryLang = (lang) => {
  return lang ? lang.split('-')[0] : null;
};

module.exports = async (req, res, next) => {
  const i18n = $inst.cloneInstance({
    lng: queryLang(get(req, 'query.lang')),
  });

  ctx.set('q3-session:locale', i18n);
  req.i18n = i18n;

  req.tChange = (lang) =>
    i18n.changeLanguage(queryLang(lang));

  req.t = (msg, variables) => {
    return i18n.t(
      msg,
      Array.isArray(variables)
        ? {
            postProcess: 'sprintf',
            sprintf: variables,
          }
        : null,
    );
  };

  req.dirty = (msg, variables) =>
    req.t(`validations:${msg}`, variables);

  req.clean = (msg, variables) =>
    req.t(`messages:${msg}`, variables);

  // the following methods are namespace aliases
  req.t.val = (msg, variables) =>
    req.t(`validations:${msg}`, variables);

  req.t.msg = (msg, variables) =>
    req.t(`messages:${msg}`, variables);

  req.t.err = (msg, variables) =>
    req.t(`errors:${msg}`, variables);

  next();
};
