const path = require('path');
const { get, pick, isObject } = require('lodash');
const fs = require('fs');
const { exception } = require('q3-core-responder');
const Scheduler = require('q3-core-scheduler');
const {
  compose,
  verify,
  check,
} = require('q3-core-composer');
const aws = require('../config/aws');

const app = require('../config/express');
const { toQuery } = require('./casters');

const uploads = async (files) =>
  isObject(files)
    ? Promise.all(
        Object.entries(files).map(async ([key, file]) => {
          const filename = `queuing/${key}`;
          await aws().add(filename, file.data);
          return filename;
        }),
      )
    : [];

// renamed to "processes"
// will edit the variables eventually
const getActionPath = (bridgeType, template) => {
  const action = path.join(
    // default to root directory
    get(app, 'locals.location', process.cwd()),
    'processes',
    bridgeType,
    `${template}.js`,
  );

  if (!fs.existsSync(action))
    exception('InternalServerError')
      .msg('unknownBridge')
      .throw();

  return action;
};

module.exports = (bridgeType) => {
  const ctrl = async (req, res) => {
    const template = get(req, 'query.template');
    const action = getActionPath(bridgeType, template);

    if (bridgeType !== 'pipeline') {
      await Scheduler.queue('onCharacterCollection', {
        ...pick(req, ['query', 'session']),
        buckets: await uploads(req.files),
      });

      res.acknowledge();
    } else {
      res.ok({
        // eslint-disable-next-line
        data: await require(action)({
          $match: toQuery(req),
        }),
      });
    }
  };

  ctrl.authorization = [verify];
  ctrl.validation = [check('template').isString()];

  return compose(ctrl);
};
