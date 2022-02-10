const { compose, redact } = require('q3-core-composer');
const { Domains } = require('../../models');

const getDomain = async (req, res) => {
  const domain = await Domains.findOne({
    lng: req.headers['content-language'] || 'en',
    tenant: req.headers['x-session-tenant'],
  });

  res.json(
    domain
      ? {
          domain: domain.toJSON(),
        }
      : {
          domain: {},
        },
  );
};

getDomain.authorization = [
  redact('domain').inResponse('domain').done(),
];

module.exports = compose(getDomain);
