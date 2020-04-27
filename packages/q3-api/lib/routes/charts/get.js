const {
  verify,
  check,
  compose,
} = require('q3-core-composer');
const crypto = require('crypto');
const exception = require('q3-core-responder');
const { get } = require('lodash');
const aqp = require('api-query-params');
const app = require('../../config/express');

const makePayload = (id) =>
  `id=${id}&timestamp=${Math.floor(
    Date.now() / 1000,
  )}&expires-in=${300}`;

const makeHmac = () =>
  crypto.createHmac(
    'sha256',
    process.env.MONGODB_EMBEDDING_KEY,
  );

const makeFilter = (filter) =>
  `&filter=${encodeURIComponent(
    JSON.stringify(aqp(filter).filter),
  )}`;

const MongoDbChartsController = async (
  { user, query: { id, ...rest } },
  res,
) => {
  if (
    !get(app, `locals.charts.${id}`, []).includes(user.role)
  )
    exception('Authorization')
      .msg('cannotViewChart')
      .throw();

  const hmac = makeHmac();
  let payload = makePayload(id);

  if (typeof rest === 'object' && Object.keys(rest).length)
    payload += makeFilter(rest);

  hmac.update(payload);

  const signature = hmac.digest('hex');
  const url = `${process.env.MONGODB_EMBEDDING_BASE}/embed/charts?${payload}&signature=${signature}`;

  res.ok({
    url,
  });
};

MongoDbChartsController.authorization = [verify];

MongoDbChartsController.validation = [
  check('id').isString(),
];

module.exports = compose(MongoDbChartsController);
