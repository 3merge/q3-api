const path = require('path');
const { get, pick } = require('lodash');
const fs = require('fs');
const { exception } = require('q3-core-responder');
const Scheduler = require('q3-core-scheduler');
const {
  compose,
  verify,
  check,
} = require('q3-core-composer');

const app = require('../config/express');
const { toQuery } = require('./casters');

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
      // UPLOAD FILES??
      await Scheduler.queue(
        'onCharacterCollection',
        pick(req, ['headers', 'query']),
      );

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
