const { size, compact, flatten } = require('lodash');
const { exception } = require('q3-core-responder');
const { Redact } = require('q3-core-access');
const hasField = require('./hasField');
const { moveWithinPropertyName } = require('../utils');

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

      if (!this.meetsFieldRequirements(fields, req.body))
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

  meetsFieldRequirements(fields, body = {}) {
    const { required } = this.locations;
    const requiredPaths = compact(flatten([required]));

    if (!size(requiredPaths)) return true;

    try {
      const passedKeys = Object.keys(
        Redact.flattenAndReduceByFields(
          {
            ...requiredPaths.reduce(
              (acc, curr) =>
                Object.assign(acc, { [curr]: 1 }),
              {},
            ),
            // a non-array indicates we just need a match
            // at the top-level
            ...(Array.isArray(required)
              ? moveWithinPropertyName(
                  this.locations.prefix,
                  body,
                )
              : body),
          },
          {
            fields,
          },
          {
            includeConditionalGlobs: true,
            keepFlat: true,
          },
        ),
      );

      return requiredPaths.every((item) =>
        passedKeys.includes(item),
      );
    } catch (e) {
      return false;
    }
  }
}

module.exports = (m) => new IsAuthorizedInLocationRef(m);
