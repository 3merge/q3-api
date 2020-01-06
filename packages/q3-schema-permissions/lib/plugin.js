/* eslint-disable no-param-reassign, func-names */
const { get } = require('lodash');
const mongoose = require('mongoose');
const { exception } = require('q3-core-responder');
const Comparison = require('comparisons');

module.exports = (schema, { getUser, lookup }) => {
  const isConfigured = () =>
    getUser &&
    typeof getUser === 'function' &&
    typeof lookup === 'string';

  const hasCollection = (name) =>
    new Promise((resolve) =>
      mongoose.connection.db
        .listCollections({ name })
        .toArray(function(err) {
          resolve(!err);
        }),
    );

  const hasOptions = async (d) =>
    (await hasCollection(lookup)) && 'options' in d
      ? d.options.redact
      : d.redact;

  const hasGrant = (grant) => {
    if (!grant)
      exception('Authorization')
        .msg('recordMissing')
        .throw();
  };

  const meetsUserRequirements = (a = []) => {
    const user = getUser();
    const doc =
      user && 'toJSON' in user ? user.toJSON() : user;
    if (!new Comparison(a).eval(doc))
      exception('Authorization')
        .msg('ownershipConditions')
        .throw();
  };

  const getPluralizedCollectionName = (n) =>
    new RegExp(
      `${
        n.charAt(n.length - 1) === 's'
          ? n.substring(0, n.length - 1)
          : n
      }+(s?)$`,
      'i',
    );

  if (!isConfigured()) return;

  schema.statics.can = async function(op) {
    const { collectionName } = this.collection;
    const { discriminators } = schema;

    let coll = [collectionName];

    if (discriminators)
      coll = coll.concat(Object.keys(discriminators));

    const grant = await mongoose
      .model(lookup)
      .findOne({
        role: get(getUser(), 'role', 'Public'),
        coll: coll.map(getPluralizedCollectionName),
        op,
      })
      .lean()
      .exec();

    hasGrant(grant);
    meetsUserRequirements(grant.ownershipConditions);

    return grant;
  };

  async function checkOp(next, options = {}) {
    const createdBy = get(getUser(), '_id', null);

    this.__user = createdBy;
    if (this.isNew) this.createdBy = createdBy;

    if (await hasOptions(options))
      await this.constructor.can(
        options.op || this.isNew ? 'Create' : 'Update',
      );
  }

  async function useQuery() {
    if (!(await hasOptions(this))) return;

    const user = getUser();
    const createdBy = get(user, '_id', null);

    const {
      ownership = 'Own',
      ownershipAliases = [],
      documentConditions = [],
    } = await this.model.can('Read');

    const { $and } = new Comparison(
      documentConditions,
    ).query();

    if ($and.length) this.and($and);

    if (ownership !== 'Any') {
      const aliases = ownershipAliases.map(
        ({ foreign, local }) => ({
          [local]: user[foreign],
        }),
      );

      if (aliases.length) {
        this.or(
          aliases.concat({
            createdBy,
          }),
        );
      } else {
        this.where({
          createdBy,
        });
      }
    }
  }

  schema.pre('save', checkOp);
  schema.pre('find', useQuery);
  schema.pre('findOne', useQuery);
  schema.pre('count', useQuery);
  schema.pre('countDocuments', useQuery);
  schema.pre('estimatedDocumentCount', useQuery);
  schema.pre('distinct', useQuery);

  schema.add({
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      autopopulate: true,
      autopopulateSelect: 'id firstName lastName email',
      systemOnly: true,
      private: true,
    },
  });
};
