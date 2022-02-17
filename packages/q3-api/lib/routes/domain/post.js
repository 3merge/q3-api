const { Grant, Redact } = require('q3-core-access');
const { compose, redact } = require('q3-core-composer');
const { get, set, omit, invoke, merge } = require('lodash');
const { Domains } = require('../../models');

const removeUnwantedProps = (xs) => ({
  logo: null,
  favicon: null,
  terms: null,
  cancellation: null,
  privacy: null,
  photo: null,

  ...omit(xs, [
    'uploads',
    'thread',
    'changelog',
    'lastModifiedBy',
    'active',
    'id',
    'createdAt',
    'updatedAt',
    'createdBy',
  ]),
});

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

  // this is a free-for-all object
  // it might contain otherwise restricted key names
  set(
    body,
    'resources',
    merge(
      {},
      get(domain, 'resources', {}),
      get(req, 'body.resources'),
    ),
  );

  // cannot modify by anyone
  delete body.tenant;
  delete body.lng;

  await domain.handleReq({ body, files });
  await domain.set(body).save();
  const output = removeUnwantedProps(marshal(domain));

  // see get.js for explanation
  set(output, 'resources', get(domain, 'resources', {}));

  res.update({
    domain: output,
  });
};

postDomain.authorization = [
  redact('domain').inResponse('domain').done(),
];

const Ctrl = compose(postDomain);

Ctrl.removeUnwantedProps = removeUnwantedProps;
module.exports = Ctrl;
