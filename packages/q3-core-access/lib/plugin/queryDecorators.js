const { get, size } = require('lodash');
const { exception } = require('q3-core-responder');
const Grant = require('../core/grant');
const { extractUser } = require('../helpers');

const checkFieldsLengthOnGrant = (xs) => {
  if (!xs || !xs.fields || !size(xs.fields))
    exception('Authorization')
      .msg('grantRequiredToRead')
      .throw();
};

module.exports = (schema) => {
  function getActiveUser() {
    return extractUser(this);
  }

  function getCollectionName() {
    return get(this, 'model.collection.collectionName');
  }

  function getReadGrant() {
    const g =
      new Grant(this.getActiveUser())
        .can('Read')
        .on(this.getCollectionName())
        .first() || {};

    checkFieldsLengthOnGrant(g);

    return {
      ownership: 'Own',
      ownershipAliasesOnly: false,
      ownershipAliasesWith: false,
      ownershipAliases: [],
      documentConditions: [],
      ...g,
    };
  }

  return [
    getActiveUser,
    getCollectionName,
    getReadGrant,
  ].reduce((acc, curr) => {
    // eslint-disable-next-line
    schema.query[curr.name] = curr;
    acc[curr.name] = curr;
    return acc;
  }, {});
};
