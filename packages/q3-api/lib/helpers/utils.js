const path = require('path');
const fs = require('fs');
const {
  get,
  map,
  size,
  isFunction,
  set,
  find,
  isObject,
} = require('lodash');
const mongoose = require('mongoose');
const session = require('q3-core-session');
const {
  getWebAppUrlAsTenantUser,
} = require('q3-core-mailer/lib/utils');
const parse = require('q3-core-rest/lib/queryParser');
const { check } = require('q3-core-composer');
const {
  findFileTraversingUpwards,
} = require('q3-schema-utils');
const { exception } = require('q3-core-responder');
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

const cleanStringFuncFromParam = (str) => {
  const match = String(str).match(/\(?string\((.*?)\)/);
  return Array.isArray(match) ? match[1] : str;
};

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

const setExecutableTemplateVariablesInRequest =
  (controller) => (req, res) => {
    set(
      req,
      '$datasource',
      get(req, 'datasource.modelName'),
    );
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
        cleanStringFuncFromParam(value),
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

const handleExtRefData = async ({ data }) => {
  await Promise.all(
    map(data, async ({ collection, keys, id }) =>
      mongoose.models[collection].initializeFuzzySearching({
        $or: keys.flatMap((k) => [
          { [k]: mongoose.Types.ObjectId(id) },
          { [k]: id },
        ]),
      }),
    ),
  );
};

const replaceSpaces = (str) =>
  String(str).replace(/\s/gi, '%20');

const getWebAppUrlByUser = getWebAppUrlAsTenantUser;

const objectIdEquals = (a, b) => {
  try {
    const { ObjectId } = mongoose.Types;
    return ObjectId(a).equals(ObjectId(b));
  } catch (e) {
    return false;
  }
};

const checkAccessByFileNameAndRoleType = (
  req,
  filename,
) => {
  const accessControlSettings = find(
    findFileTraversingUpwards(
      get(req, 'app.locals.location'),
      filename,
    ),
    (item) =>
      get(item, 'name') ===
      cleanStringFuncFromParam(get(req, 'query.template')),
  );

  if (
    isObject(accessControlSettings) &&
    Array.isArray(accessControlSettings.role) &&
    !accessControlSettings.role.includes(
      get(req, 'user.role', 'Public'),
    )
  )
    exception('Authorization')
      .msg('cannotAccessResource')
      .throw();

  return accessControlSettings;
};

const toObjectId = (xs) => {
  if (xs && mongoose.Types.ObjectId.isValid(xs)) {
    const r = mongoose.Types.ObjectId(xs);
    return r.toString() === String(xs) ? r : null;
  }

  return null;
};

const isEqualToObjectId = (a, b) => {
  try {
    return toObjectId(a).equals(toObjectId(b));
  } catch (e) {
    return false;
  }
};

const iterateTenantSessions = async (callback) => {
  // eslint-disable-next-line
  for await (const domain of await Q3.model('domains')
    .find({
      active: true,
    })
    .lean()
    .exec()) {
    session.set('TENANT', domain.tenant);
    await callback(domain);
  }
};

module.exports = {
  toQuery,
  toUndefined,
  handleExtRefData,
  execPurgeSessionAppConfig,
  joinJsFileWithAppRoot,
  setExecutableTemplateVariablesInRequest,
  setExecutableTemplatePathInRequest,
  replaceSpaces,
  getWebAppUrlByUser,
  objectIdEquals,
  checkAccessByFileNameAndRoleType,
  toObjectId,
  isEqualToObjectId,
  iterateTenantSessions,
};
