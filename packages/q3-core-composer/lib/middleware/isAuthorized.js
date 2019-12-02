const micromatch = require('micromatch');
const { set } = require('lodash');
const hasField = require('./hasField');

const splitter = (s) =>
  String(s)
    .split(',')
    .map((i) => i.trim());

const getFields = (grant) =>
  splitter(grant || !grant.fields ? grant.fields : '!*');

const getReadOnly = (grant) =>
  splitter(
    grant || !grant.readOnly ? grant.readOnly : '!*',
  );

const makeAuthorizationError = (t) => {
  const e = new Error();
  e.name = 'Authorization';
  e.message = t
    ? t('messages:fieldPermissions')
    : 'Insufficent field-level permissions';

  return e;
};

class IsAuthorizedInLocationRef {
  constructor(modelName) {
    this.source = modelName;
    this.locations = {
      request: [],
      response: [],
    };
  }

  done() {
    return this.middleware.bind(this);
  }

  async middleware(req, res, next) {
    try {
      const m = this.source;
      const grant = await req.authorize(m);
      const fields = getFields(grant);
      const readOnly = getReadOnly(grant);

      const forNext = this.meetsFieldRequirements(
        makeAuthorizationError(req.t),
        fields,
      );

      set(req, `redactions.${m}`, {
        locations: this.locations,
        readOnly,
        fields,
      });

      next(forNext);
    } catch (err) {
      next(err);
    }
  }

  withPrefix(prefix) {
    this.locations.prefix = prefix;
    return this;
  }

  inRequest(location) {
    this.locations.request.push(location);
    return this;
  }

  inResponse(location) {
    this.locations.response.push(location);
    return this;
  }

  requireField(field) {
    this.locations.required = hasField(this.source, field);
    return this;
  }

  meetsFieldRequirements(resp, fields) {
    const { required } = this.locations;
    if (!required) return undefined;

    const outcome = Array.isArray(required)
      ? micromatch(required, fields).length ===
        required.length
      : micromatch.isMatch(this.locations.required, fields);

    return !outcome ? resp : undefined;
  }
}

module.exports = (m) => new IsAuthorizedInLocationRef(m);
