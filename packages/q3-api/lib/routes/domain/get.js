const { compose, redact } = require('q3-core-composer');
const { Domains } = require('../../models');
const { removeUnwantedProps } = require('./post');

const getDomain = async (req, res) => {
  const { tenant, tenantLng } = req;

  res.json({
    domain: removeUnwantedProps(
      req.marshal(
        await Domains.findOne({
          lng: tenantLng,
          tenant,
        })
          .lean()
          .exec(),
      ),
    ),
  });
};

getDomain.authorization = [
  redact('domain').inResponse('domain').done(),
];

module.exports = compose(getDomain);
