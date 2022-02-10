const { Grant, Redact } = require('q3-core-access');
const { compose, redact } = require('q3-core-composer');
const { omit, invoke } = require('lodash');
const { Domains } = require('../../models');

const postDomain = async (req, res) => {
  const { files, marshal } = req;
  const grant = new Grant(req.user)
    .can('Create')
    .on('domain')
    .test({});

  const body = Redact.flattenAndReduceByFields(
    req.body,
    grant,
  );

  const tenant = req.headers['x-session-tenant'];
  const domain = await Domains.findOne({
    lng: req.headers['content-language'] || 'en',
    tenant,
  }).select('+uploads');

  invoke(req.user, 'checkTenant', tenant);
  await domain.handleReq({ body, files });
  await domain.set(body).save();

  res.update({
    domain: {
      logo: null,
      favicon: null,
      terms: null,
      cancellation: null,
      privacy: null,
      photo: null,

      // defaults in case they've been stripped out.
      ...omit(marshal(domain), ['uploads', 'thread']),
    },
  });
};

postDomain.authorization = [
  redact('domain').inResponse('domain').done(),
];

module.exports = compose(postDomain);
