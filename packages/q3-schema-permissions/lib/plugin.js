/* eslint-disable no-param-reassign */
const { get } = require('lodash');
const { Schema } = require('mongoose');
const { exception } = require('q3-core-responder');
const Comparison = require('comparisons');

const accessControl = (getUser, getGrant) => ({
  append() {
    const user = getUser();

    if (user) {
      // for history plugin
      this.__user = user._id;

      if (this.isNew && !this.createdBy)
        this.createdBy = user._id;
    }
  },

  identify() {
    const user = getUser();
    const grant = getGrant();
    const { bypassAuthorization } = this.options;

    if (bypassAuthorization || (!grant && !user)) return;

    this.eval(grant);
    this.belongsTo(grant, user);

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
    'find',
    'findOne',
    'distinct',
    'count',
    'countDocuments',
  ];

  schema.pre('save', ac.append);

  schema.query.eval = function parseStringOp(grant) {
    const { $and } = new Comparison(
      get(grant, 'documentConditions', []),
    ).query();

    if ($and.length) {
      this.and($and);
    }
  };

  schema.query.belongsTo = function addCreator(
    grant,
    user,
  ) {
    if (
      get(grant, 'ownership') === 'Any' ||
      get(grant, 'role') === 'Public'
    )
      return;

    if (!user || !user._id)
      exception('Authentication')
        .msg('sessionUser')
        .throw();

    const createdBy = user._id;
    const aliases = get(grant, 'ownershipAliases', []).map(
      ({ foreign, local }) => ({
        [local]: user[foreign],
      }),
    );

    if (aliases.length) {
      this.or(aliases.concat({ createdBy }));
    } else {
      this.where({
        createdBy,
      });
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
