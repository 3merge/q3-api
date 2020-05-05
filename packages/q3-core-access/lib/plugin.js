/* eslint-disable no-param-reassign, func-names */
const { get } = require('lodash');
const Comparison = require('comparisons');
const mongoose = require('mongoose');
const { exception } = require('q3-core-responder');
const Grant = require('./core/grant');
const { hasOptions, extractUser } = require('./helpers');

module.exports = (schema) => {
  async function checkOp(next, options = {}) {
    const { collectionName } = this.collection;
    const user = extractUser(this);
    let op = options.op || 'Update';

    if (this.isNew) this.createdBy = user;
    if (this.isNew) op = 'Create';

    if (this.modifiedPaths().includes('active'))
      op = 'Delete';

    if (
      hasOptions(options) &&
      !Grant(user)
        .can(op)
        .on(collectionName)
        .test(this.toJSON())
    )
      exception().throw();
  }

  async function useQuery() {
    if (!hasOptions(this)) return;

    const { collectionName } = this.collection;
    const user = extractUser(this);
    const createdBy = get(user, '_id', null);

    const {
      ownership = 'Own',
      ownershipAliases = [],
      documentConditions = [],
    } = Grant(user).can('Read').on(collectionName).first();

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
