const { get, set } = require('lodash');
const { flatten, unflatten } = require('flat');
const micromatch = require('micromatch');
const mung = require('express-mung');

const splitDelineatedList = (doc = {}) =>
  String(doc.fields || '!*')
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

  // allow call stack to clear
  // otherwise, it maximizes
  return new Promise((resolve) => {
    setTimeout(() => {
      Object.values(redactions).forEach(
        ({ fields, locations }) =>
          get(locations, target, []).forEach((field) => {
            const prev = mutable[field];
            const { prefix } = locations;

            const filter = (input) => {
              let i = input;
              if (prefix)
                i = {
                  [prefix]: input,
                };

              let o = filterObject(fields, i);
              if (prefix) o = o[prefix];

              return o;
            };

            // eslint-disable-next-line
            mutable[field] = !Array.isArray(prev)
              ? filter(prev)
              : prev.map(filter);
          }),
      );
      resolve();
    }, 0);
  });
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
      console.log(grant);
      set(req, `redactions.${modelName}`, {
        fields: splitDelineatedList(grant),
        locations,
      });

      next();
    } catch (err) {
      next(err);
    }
  };

  chain.withPrefix = function setPrefix(prefix) {
    locations.prefix = prefix;
    return this;
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

const verify = ({ user }, res, next) => {
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

  authorizeResponse: mung.jsonAsync(async (body, req) => {
    await iterateRedactions(req, 'response', body);
    return body;
  }),

  authorizeRequest: async (req, res, next) => {
    await iterateRedactions(req, 'request', req);
    next();
  },
};
