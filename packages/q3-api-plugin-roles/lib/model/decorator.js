const Q3 = require('q3-api').default;
const { Errors } = require('q3-api');
const { get } = require('lodash');
const { flatten, unflatten } = require('flat');
const micromatch = require('micromatch');

module.exports = class AccessDecorator {
  static async can(op, coll, role = { $exists: false }) {
    const grants = this.findOne({
      op,
      coll,
      role,
    });

    if (!grants)
      throw new Errors.AuthorizationError(
        Q3.translate('message:insufficientPermissions'),
      );

    return grants;
  }

  pickFrom(obj = {}) {
    const flat = flatten(obj);
    const match = micromatch(
      Object.keys(flat),
      get(this, 'fields', '!*').split(', '),
    ).reduce((acc, key) => {
      acc[key] = flat[key];
      return acc;
    }, {});

    return unflatten(match);
  }
};
