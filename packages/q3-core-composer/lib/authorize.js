const { get, set } = require('lodash');
const { flatten, unflatten } = require('flat');
const micromatch = require('micromatch');
const mung = require('express-mung');

const splitDelineatedList = (doc = {}) =>
  String(doc.fields || '!*')
    .split(',')
    .map((i) => i.trim());

const ifArray = (input, next) =>
  !Array.isArray(input) ? next(input) : input.map(next);

// @TODO
// this needs refactoring
// needs conditional?

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
      const fields = splitDelineatedList(grant);
      set(req, `redactions.${modelName}`, {
        locations,
        fields,
      });

      if (
        locations.required &&
        !micromatch.isMatch(locations.required, fields)
      ) {
        const e = new Error();
        e.name = 'AuthorizationError';
        e.message = req.t
          ? req.t('messages:fieldPermissions')
          : 'Insufficent field-level permissions';
        throw e;
      }

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

  chain.requireField = function setRequiredField(field) {
    locations.required = field;
    return this;
  };

  return chain;
};

const verify = ({ user, passedGrants }, res, next) => {
  if (!user && !passedGrants) {
    res.status(401).send();
  } else {
    next();
  }
};

class FieldRedactionCommander {
  constructor(id, target = {}) {
    if (!id || !['response', 'request'].includes(id))
      throw new Error(
        'ID must equal "request" or "response"',
      );

    this.id = id;
    this.mutable = target;
  }

  $append(doc) {
    return ifArray(doc, (v) =>
      this.prefix
        ? {
            [this.prefix]: v,
          }
        : v,
    );
  }

  $detach(doc) {
    return ifArray(doc, (v) =>
      this.prefix ? v[this.prefix] : v,
    );
  }

  $filter(doc = {}) {
    const flat = flatten(doc);
    const match = micromatch(
      Object.keys(flat),
      this.fields,
    );

    const unwind = match.reduce(
      (acc, key) =>
        Object.assign(acc, {
          [key]: flat[key],
        }),
      {},
    );

    return unflatten(unwind);
  }

  $runTransformers(acc, v) {
    const input = this.$append(this.mutable[v]);
    const output = ifArray(input, this.$filter.bind(this));
    const transformed = this.$detach(output);

    return Object.assign(acc, {
      [v]: transformed,
    });
  }

  $getEntries() {
    return new Promise((resolve) =>
      setTimeout(() => {
        resolve(
          this.rules.reduce(
            this.$runTransformers.bind(this),
            {},
          ),
        );
      }, 0),
    );
  }

  // really, the only public method
  exec({ fields = [], locations = {} }) {
    const { prefix } = locations;
    this.rules = get(locations, this.id, []);
    this.fields = fields;
    this.prefix = prefix;
    return this.$getEntries();
  }
}

const process = async ({ redactions }, mutable, id) => {
  if (!redactions) return;
  const rules = Object.values(redactions);

  const entries = await Promise.all(
    rules.map((...args) => {
      const inst = new FieldRedactionCommander(id, mutable);
      return inst.exec(...args);
    }),
  );

  const primed = entries.reduce(
    (a, b) => Object.assign(a, b),
    {},
  );

  Object.assign(mutable, primed);
};

module.exports = {
  redact,
  verify,

  authorizeResponse: mung.jsonAsync(async (body, req) => {
    await process(req, body, 'response');
    return body;
  }),

  authorizeRequest: async (req, res, next) => {
    await process(req, req, 'request');
    next();
  },
};
