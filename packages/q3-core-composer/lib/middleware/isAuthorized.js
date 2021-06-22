const micromatch = require('micromatch');
const { exception } = require('q3-core-responder');
const hasField = require('./hasField');

class IsAuthorizedInLocationRef {
  constructor(modelName) {
    this.source = modelName;
    this.locations = {
      response: [],
    };
  }

  done() {
    return this.middleware.bind(this);
  }

  middleware(req, res, next) {
    try {
      const m = this.source;
      const grant = req.authorize(m);
      const { fields } = grant;

      if (!this.meetsFieldRequirements(fields))
        throw new Error('Incomplete grant');

      if (!Array.isArray(req.redactions))
        req.redactions = [];

      req.redactions.push({
        locations: this.locations,
        collectionName: m,
        grant,
      });

      next();
    } catch (err) {
      next(
        exception(
          req.user ? 'Authorization' : 'Authentication',
        ).boomerang(),
      );
    }
  }

  withPrefix(prefix) {
    this.locations.prefix = prefix;
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

  meetsFieldRequirements(fields) {
    const { required } = this.locations;
    if (!required) return true;

    return Array.isArray(required)
      ? micromatch(required, fields).length ===
          required.length
      : micromatch.isMatch(this.locations.required, fields);
  }
}

module.exports = (m) => new IsAuthorizedInLocationRef(m);
