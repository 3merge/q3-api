const fs = require('fs');
const path = require('path');
const { filterByRoleType } = require('../helpers');

const getSeedDataFromPath = (dir) => {
  const joinPath = (relativity) =>
    path.join(dir, `${relativity}/q3-access.json`);

  const loadFrom = (filepath) =>
    // eslint-disable-next-line
    fs.existsSync(filepath) ? require(filepath) : null;

  return Array.from({ length: 3 }).reduce(
    (acc, curr, i) =>
      loadFrom(
        joinPath(
          Array.from({ length: i })
            .map(() => '.')
            .join(''),
        ),
      ) || acc,
    [],
  );
};

const AccessControl = {
  init(src = []) {
    let grants = [];

    if (typeof src === 'string')
      grants = getSeedDataFromPath(src);
    else if (Array.isArray(src)) grants = src;

    AccessControl.grants = grants
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
