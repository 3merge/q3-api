const { filterByRoleType } = require('../helpers');

const AccessControl = {
  init(seedData = []) {
    AccessControl.grants = seedData
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
