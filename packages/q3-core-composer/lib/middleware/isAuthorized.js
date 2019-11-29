const micromatch = require('micromatch');
const { set } = require('lodash');

const getFields = (grant) =>
  String(grant || !grant.fields ? grant.fields : '!*')
    .split(',')
    .map((i) => i.trim());

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
      const forNext = this.meetsFieldRequirements(
        makeAuthorizationError(req.t),
        fields,
      );

      set(req, `redactions.${m}`, {
        locations: this.locations,
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
    this.locations.required = field;
    return this;
  }

  meetsFieldRequirements(resp, fields) {
    return this.locations.required &&
      !micromatch.isMatch(this.locations.required, fields)
      ? resp
      : undefined;
  }
}

module.exports = (m) => new IsAuthorizedInLocationRef(m);
