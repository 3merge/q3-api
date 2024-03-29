const { get, first } = require('lodash');
const { Domains } = require('../models');
const { clean } = require('../helpers/multitenantPlugin');

module.exports = (req, res, next) => {
  const tenant = clean(
    req.user
      ? req.user.tenant
      : get(req, 'headers.x-session-tenant'),
  );

  const shouldThrowTenantError = () =>
    req.originalUrl !== '/stream' &&
    String(process.env.ARCHITECTURE).toUpperCase() ===
      'MULTITENANT';

  // MUST BE HERE FOR Q3-CORE-SESSION
  // TO RELAY THE VALUE
  req.tenant = tenant;
  req.tenantLng = first(
    String(
      req.user
        ? req.user.lang
        : clean(req.headers['content-language']) || 'en',
    ).split('-'),
  );

  // language no longer served here
  return Domains.findOne({
    active: true,
    tenant,
  })
    .lean()
    .select('_id')
    .exec()
    .then((resp) => {
      if (!resp && shouldThrowTenantError()) {
        const err = new Error('Failed tenant screening');
        err.statusCode = 400;
        next(err);
      } else {
        next();
      }
    });
};
