/* eslint-disable no-param-reassign, func-names */
const { get } = require('lodash');
const Comparison = require('comparisons');
const mongoose = require('mongoose');
const { exception } = require('q3-core-responder');
const Grant = require('./core/grant');
const { hasOptions, extractUser } = require('./helpers');

const reportAccessLevelFailure = (condition = true) =>
  condition
    ? exception('Authorization')
        .msg('insufficientAccessLevels')
        .throw()
    : null;

const getOp = (ctx, options) => {
  if (ctx.isNew) return 'Create';
  if (ctx.modifiedPaths().includes('active'))
    return 'Delete';

  if (options.op) return options.op;
  return 'Updated';
};

module.exports = (schema) => {
  function checkOp(options = {}) {
    const user = extractUser(this);
    const { collectionName } = this.collection;
    const op = getOp(this, options);

    if (this.isNew && user) this.createdBy = user._id;

    reportAccessLevelFailure(
      hasOptions(options) &&
        !new Grant(user)
          .can(op)
          .on(collectionName)
          .test(this.toJSON()),
    );
  }

  function useQuery() {
    if (!hasOptions(this)) return;

    const {
      collection: { collectionName },
    } = this.model;
    const user = extractUser(this);
    const createdBy = get(user, '_id', null);

    const doc = new Grant(user)
      .can('Read')
      .on(collectionName)
      .first();

    reportAccessLevelFailure(!doc);

    const {
      ownership = 'Own',
      ownershipAliases = [],
      documentConditions = [],
    } = doc;

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

  if (!schema.options.disableOwnership) {
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
        autopopulateSelect:
          'id _id firstName lastName email',
        ref: 'q3-api-users',
        systemOnly: true,
        private: true,
      },
    });
  }
};
