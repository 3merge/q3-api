const path = require('path');
const { get, isFunction, isObject } = require('lodash');
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

const getSession = (req) => {
  try {
    return isFunction(get(req, 'app.locals.purgeSession'))
      ? req.app.locals.purgeSession(req.session)
      : req.session;
  } catch (e) {
    return {};
  }
};

const getActionPath = (template) => {
  const action = path.join(
    // default to root directory
    get(app, 'locals.location', process.cwd()),
    'reports',
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
    const session = getSession(req);
    const query = toQuery(req);

    if (bridgeType !== 'reports') {
      await Scheduler.queue(template, {
        buckets: await uploads(req.files),
        query,
        session,
      });

      res.acknowledge();
    } else {
      res.ok({
        // eslint-disable-next-line
        data: await require(getActionPath(template))(
          query,
          session,
        ),
      });
    }
  };

  ctrl.authorization = [verify];
  ctrl.validation = [check('template').isString()];

  return compose(ctrl);
};
