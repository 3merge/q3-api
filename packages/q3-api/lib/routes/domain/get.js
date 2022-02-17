const { compose } = require('q3-core-composer');
const { get, set } = require('lodash');
const { Domains } = require('../../models');
const { removeUnwantedProps } = require('./post');

const getDomain = async (req, res) => {
  const { tenant, tenantLng } = req;
  const raw = await Domains.findOne({
    lng: tenantLng,
    tenant,
  }).exec();

  const domain = removeUnwantedProps(req.marshal(raw));

  // prevent words from getting stripped out
  set(domain, 'resources', get(raw, 'resources'));

  res.json({
    domain,
  });
};

module.exports = compose(getDomain);
