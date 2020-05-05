const { filterByRoleType } = require('../helpers');

const AccessControl = {};

module.exports = {
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

    Object.freeze(AccessControl);
  },

  get(roleType) {
    if (!Array.isArray(AccessControl.grants))
      throw new Error(
        'AccessControl must first be initialized',
      );

    return filterByRoleType(AccessControl.grants, roleType);
  },
};
