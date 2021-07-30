const { exception } = require('q3-core-responder');

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
        )
          .msg(err.message)
          .boomerang(),
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
}

module.exports = (m) => new IsAuthorizedInLocationRef(m);
