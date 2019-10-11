const { get, set } = require('lodash');
const { flatten, unflatten } = require('flat');
const micromatch = require('micromatch');
const mung = require('express-mung');

const splitDelineatedList = (doc) =>
  String(doc || '!*')
    .split(',')
    .map((i) => i.trim());

const filterObject = (fields = [], doc = {}) => {
  const flat = flatten(doc);
  const match = micromatch(
    Object.keys(flat),
    fields,
  ).reduce((acc, key) => {
    acc[key] = flat[key];
    return acc;
  }, {});

  return unflatten(match);
};

const iterateRedactions = (req, target, mutable) => {
  const { redactions = {} } = req;

  Object.values(redactions).forEach(
    ({ fields, locations }) => {
      get(locations, target, []).forEach((field) => {
        // eslint-disable-next-line
        mutable[field] = !Array.isArray(mutable[field])
          ? filterObject(fields, mutable[field])
          : mutable[field].map((item) =>
              filterObject(fields, item),
            );
      });
    },
  );
};

const redact = (modelName) => {
  const locations = {
    request: [],
    response: [],
  };

  const chain = async (req, res, next) => {
    try {
      if (!req.authorization)
        throw new Error('Authorization middleware missing');

      const grant = await req.authorization(modelName);

      set(req, `redactions.${modelName}`, {
        fields: splitDelineatedList(grant),
        locations,
      });

      next();
    } catch (err) {
      next(err);
    }
  };

  chain.inRequest = function setLocation(location) {
    locations.request.push(location);
    return this;
  };

  chain.inResponse = function setLocation(location) {
    locations.response.push(location);
    return this;
  };

  return chain;
};

const verify = () => ({ user }, res, next) => {
  if (!user) {
    res.status(401).send();
  } else {
    next();
  }
};

module.exports = {
  redact,
  filterObject,
  verify,

  authorizeResponse: mung.json((body, req) => {
    iterateRedactions(req, 'response', body);
    return body;
  }),

  authorizeRequest: (req, res, next) => {
    iterateRedactions(req, 'request', req);
    next();
  },
};
