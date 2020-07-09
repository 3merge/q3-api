const path = require('path');
const { get } = require('lodash');
const fs = require('fs');
const { fork } = require('child_process');
const { exception } = require('q3-core-responder');
const queryParser = require('q3-core-rest/lib/queryParser');
const {
  compose,
  verify,
  check,
} = require('q3-core-composer');
const app = require('../config/express');
const io = require('../config/socket');

const runQueryParserOnRequest = (req) => {
  const {
    files,
    query: { template },
    user,
  } = req;

  const { query } = queryParser(req);
  delete query.template;

  return [
    template,
    {
      files,
      query,
      user,
    },
  ];
};

const runChildProcess = async (
  template,
  bridgeType,
  brideParamters,
) => {
  const action = path.join(
    // default to root directory
    get(app, 'locals.location', process.cwd()),
    'bridges',
    bridgeType,
    `${template}.js`,
  );

  if (!fs.existsSync(action))
    exception('InternalServerError')
      .msg('unknownBridge')
      .throw();

  const forked = fork(action);

  // emit the bridge type (exports, imports, reports)
  // the client subscribes to these alerts
  forked.on('message', (data) => {
    // allow only a single message to dispatch
    // force kill
    forked.kill('SIGINT');

    io.emit(bridgeType, {
      data,
    });
  });

  forked.send(brideParamters);
};

module.exports = (bridgeType) => {
  const ctrl = async (req, res) => {
    const [template, args] = runQueryParserOnRequest(req);
    await runChildProcess(template, bridgeType, args);
    res.acknowledge();
  };

  ctrl.authorization = [verify];
  ctrl.validation = [check('template').isString()];

  return compose(ctrl);
};
