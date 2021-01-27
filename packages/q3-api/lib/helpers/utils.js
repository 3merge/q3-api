const path = require('path');
const fs = require('fs');
const {
  get,
  map,
  size,
  isFunction,
  set,
} = require('lodash');
const parse = require('q3-core-rest/lib/queryParser');
const { check } = require('q3-core-composer');
const app = require('../config/express');

const asJsFile = (v) => String(v).concat('.js');

const isLast = (a, i) => size(a) - 1 === i;

const getAppRoot = () =>
  get(app, 'locals.location', process.cwd());

const joinJsFileWithAppRoot = (...params) =>
  path.join(
    getAppRoot(app),
    ...map(params, (item, i) =>
      isLast(params, i) ? asJsFile(item) : item,
    ),
  );

const toUndefined = (v) =>
  v === '' || v === null ? undefined : v;

const toQuery = (req = {}) => {
  const { query } = parse(req);
  delete query.template;

  if (query.ids) {
    query._id = query.ids;
    delete query.ids;
  }

  return query;
};

const execPurgeSessionAppConfig = (req) => {
  try {
    return isFunction(get(req, 'app.locals.purgeSession'))
      ? req.app.locals.purgeSession(req.session)
      : req.session;
  } catch (e) {
    return {};
  }
};

const setExecutableTemplateVariablesInRequest = (
  controller,
) => (req, res) => {
  set(req, '$query', toQuery(req));
  set(req, '$session', execPurgeSessionAppConfig(req));
  return controller(req, res);
};

const setExecutableTemplatePathInRequest = (directory) =>
  check('template')
    .isString()
    .custom((value, { req }) => {
      const executableTemplatePath = joinJsFileWithAppRoot(
        directory,
        value,
      );

      const exists = fs.existsSync(executableTemplatePath);

      if (exists)
        set(
          req,
          '$executableTemplatePath',
          executableTemplatePath,
        );

      return exists;
    });

module.exports = {
  toQuery,
  toUndefined,
  execPurgeSessionAppConfig,
  joinJsFileWithAppRoot,
  setExecutableTemplateVariablesInRequest,
  setExecutableTemplatePathInRequest,
};
