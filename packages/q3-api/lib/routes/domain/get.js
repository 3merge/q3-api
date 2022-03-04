const { compose } = require('q3-core-composer');
const { get, merge } = require('lodash');
const {
  Domains,
  DomainResources,
} = require('../../models');
const { removeUnwantedProps } = require('./post');

const getDomain = async (req, res) => {
  const { tenant, tenantLng } = req;
  const raw = await Domains.findOne({
    tenant,
  }).exec();

  const domainResource = await DomainResources.findOne({
    lng: tenantLng,
    tenant,
  })
    .lean()
    .exec();

  res.json({
    domain: merge(
      {},
      removeUnwantedProps(req.marshal(raw)),
      {
        lng: get(domainResource, 'lng', tenantLng),
        resources: get(domainResource, 'resources', {}),
      },
    ),
  });
};

module.exports = compose(getDomain);
