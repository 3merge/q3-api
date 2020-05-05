/* eslint-disable no-param-reassign, func-names */
const { get } = require('lodash');
const Comparison = require('comparisons');
const mongoose = require('mongoose');
const { exception } = require('q3-core-responder');
const Grant = require('./core/grant');
const { hasOptions, extractUser } = require('./helpers');

const reportAccessLevelFailure = (condition) => {
  if (condition)
    exception('Authorization')
      .msg('insufficientAccessLevels')
      .throw();
};

module.exports = (schema) => {
  async function checkOp(next, options = {}) {
    const user = extractUser(this);
    const { collectionName } = this.collection;
    let op = options.op || 'Update';

    if (this.isNew) this.createdBy = user;
    if (this.isNew) op = 'Create';

    if (this.modifiedPaths().includes('active'))
      op = 'Delete';

    reportAccessLevelFailure(
      hasOptions(options) &&
        !new Grant(user)
          .can(op)
          .on(collectionName)
          .test(this.toJSON()),
    );
  }

  async function useQuery() {
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
