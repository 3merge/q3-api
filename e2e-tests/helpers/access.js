const { AccessControl } = require('q3-core-access');
const { isEqual, pick } = require('lodash');

exports.findAndReplace = (current) => {
  const shortlist = (xs) =>
    pick(xs, ['role', 'op', 'coll']);

  AccessControl.grants = AccessControl.grants.map(
    (previous) =>
      isEqual(shortlist(previous), shortlist(current))
        ? current
        : previous,
  );
};

exports.refresh = () => {
  // eslint-disable-next-line
  AccessControl.grants = require('../q3-access.json');
};
