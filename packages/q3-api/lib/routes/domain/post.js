const { Grant, Redact } = require('q3-core-access');
const { compose, redact } = require('q3-core-composer');
const { exception } = require('q3-core-responder');
const { get, omit, invoke, merge } = require('lodash');
const {
  Domains,
  DomainResources,
} = require('../../models');

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
  let { tenantLng } = req;
  const { files, marshal, tenant } = req;

  invoke(req.user, 'checkTenant', tenant);

  const grant = new Grant(req.user)
    .can('Create')
    .on('domain')
    .test({});

  const body = Redact.flattenAndReduceByFields(
    req.body,
    grant,
  );

  const domain = await Domains.findOne({
    tenant,
  })
    .select('+uploads')
    .exec();

  if (!domain)
    exception('NotFound')
      .field('tenant')
      .msg('domainNotFound')
      .toThrow();

  if (body.lng) tenantLng = body.lng;
  const domainresource = await DomainResources.findOne({
    lng: tenantLng,
    tenant,
  }).exec();

  const resources = merge(
    {},
    get(domainresource, 'resources', {}),
    get(req, 'body.resources'),
  );

  if (domainresource) {
    domainresource.set('resources', resources, {
      strict: false,
    });

    await domainresource.save();
  } else {
    await DomainResources.create({
      lng: tenantLng,
      resources,
      tenant,
    });
  }

  delete body.tenant;
  await domain.handleReq({
    body,
    files,
  });

  await domain.set(body).save();

  res.update({
    domain: merge(
      {},
      removeUnwantedProps(marshal(domain)),
      {
        lng: tenantLng,
        resources,
      },
    ),
  });
};

postDomain.authorization = [
  redact('domain').inResponse('domain').done(),
];

const Ctrl = compose(postDomain);

Ctrl.removeUnwantedProps = removeUnwantedProps;
module.exports = Ctrl;
