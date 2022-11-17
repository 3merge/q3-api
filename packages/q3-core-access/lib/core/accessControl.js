const {
  findFileTraversingUpwards,
} = require('q3-schema-utils');
const { filterByRoleType } = require('../helpers');
const withDefaults = require('../withDefaults');

const AccessControl = {
  init(src = []) {
    let grants = [];

    if (typeof src === 'string')
      grants = findFileTraversingUpwards(
        src,
        'q3-access.json',
      );
    else if (Array.isArray(src)) grants = src;

    AccessControl.grants = withDefaults(grants)
      .filter(
        (seed) => seed && seed.coll && seed.role && seed.op,
      )
      .map((seed) => ({
        documentConditions: [],
        fields: '*',
        ownership: 'Own',
        ownershipAliases: [],
        ...seed,
      }));

    if (process.env.NODE_ENV !== 'test')
      Object.freeze(AccessControl);
  },

  purge() {
    AccessControl.grants = [];
  },

  get(roleType) {
    if (!Array.isArray(AccessControl.grants))
      throw new Error(
        'AccessControl must first be initialized',
      );

    return filterByRoleType(AccessControl.grants, roleType);
  },
};

module.exports = AccessControl;
