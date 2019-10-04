const { get } = require('lodash');
const ctx = require('request-context');
const { $inst } = require('../config/i18next');

module.exports = (req, res, next) => {
  const i18n = $inst.cloneInstance();
  const preference = get(req, 'query.lang');
  ctx.set('q3-session:locale', i18n);
  req.i18n = i18n;

  req.tChange = (lang) =>
    i18n.changeLanguage(lang.split('-')[0], () => {
      // noop
    });

  req.t = (msg, variables) =>
    i18n.t(
      msg,
      Array.isArray(variables)
        ? {
            postProcess: 'sprintf',
            sprintf: variables,
          }
        : null,
    );

  if (preference) {
    req.tChange(preference);
  }

  next();
};
