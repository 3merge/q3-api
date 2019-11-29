/* eslint-disable no-param-reassign */
const { get } = require('lodash');
const { Schema } = require('mongoose');
const { exception } = require('q3-core-responder');
const StatementReader = require('./utils');

const accessControl = (getUser, getGrant) => ({
  append() {
    const user = getUser();
    if (this.isNew && user && !this.createdBy)
      this.createdBy = user._id;
  },

  identify() {
    const user = getUser();
    const grant = getGrant();
    const { bypassAuthorization } = this.options;
    const createdBy = get(user, '_id');
    const ownershipAliases = get(
      grant,
      'ownershipAliases',
      [],
    );

    const documentConditions = get(
      grant,
      'documentConditions',
      [],
    );

    if (!user && !grant && !bypassAuthorization)
      exception('Authorization')
        .msg('Grants required to continue')
        .throw();

    if (
      bypassAuthorization ||
      get(grant, 'ownership') === 'Any'
    )
      return;

    if (documentConditions) this.eval(documentConditions);

    if (ownershipAliases.length) {
      this.or([
        { createdBy },
        ...ownershipAliases.map(({ foreign, local }) => ({
          [local]: user[foreign],
        })),
      ]);
    } else {
      this.where({
        createdBy,
      });
    }

    if (
      process.env.NODE_ENV === 'test' &&
      process.env.DEBUG
    )
      // eslint-disable-next-line
      console.log(this.getQuery());
  },
});

module.exports = (schema, sessionActions) => {
  if (schema.disableOwnership || !sessionActions) return;

  const ac = accessControl(
    sessionActions.getUser,
    sessionActions.getGrant,
  );

  const queryMethods = [
    'count',
    'countDocuments',
    'distinct',
    'find',
    'findOne',
  ];

  schema.pre('save', ac.append);

  schema.query.eval = function parseStringOp(conds) {
    const statements = new StatementReader(conds).get();
    if (statements.length) {
      this.and(statements);
    }
  };

  queryMethods.forEach((name) =>
    schema.pre(name, ac.identify),
  );

  schema.add({
    createdBy: {
      type: Schema.Types.ObjectId,
      private: true,
    },
  });
};
