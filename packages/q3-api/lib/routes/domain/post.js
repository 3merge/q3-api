const { Grant, Redact } = require('q3-core-access');
const { compose, redact } = require('q3-core-composer');
const { omit, invoke } = require('lodash');
const { Domains } = require('../../models');

const removeUnwantedProps = (xs) =>
  omit(xs, [
    'uploads',
    'thread',
    'changelog',
    'lastModifiedBy',
    'active',
    'id',
    'createdAt',
    'updatedAt',
    'createdBy',
  ]);

const postDomain = async (req, res) => {
  const { files, marshal } = req;

  // domain NOT domains
  // that's a very important distinction here
  const grant = new Grant(req.user)
    .can('Create')
    .on('domain')
    .test({});

  const body = Redact.flattenAndReduceByFields(
    req.body,
    grant,
  );

  const { tenant, tenantLng } = req;
  const domain = await Domains.findOne({
    lng: tenantLng,
    tenant,
  }).select('+uploads');

  invoke(req.user, 'checkTenant', tenant);

  // cannot modify by anyone
  delete body.tenant;
  delete body.lng;

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
      ...removeUnwantedProps(marshal(domain)),
    },
  });
};

postDomain.authorization = [
  redact('domain').inResponse('domain').done(),
];

const Ctrl = compose(postDomain);

Ctrl.removeUnwantedProps = removeUnwantedProps;
module.exports = Ctrl;
