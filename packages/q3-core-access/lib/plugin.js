/* eslint-disable no-param-reassign, func-names */
const { get } = require('lodash');
const Comparison = require('comparisons');
const mongoose = require('mongoose');
const { exception } = require('q3-core-responder');
const Grant = require('./core/grant');
const { hasOptions, extractUser } = require('./helpers');

const reportAccessLevelFailure = (condition) =>
  condition
    ? exception('Authorization')
        .msg('insufficientAccessLevels')
        .boomerang()
    : undefined;

const getOp = (ctx, options) => {
  if (ctx.isNew) return 'Create';
  if (ctx.modifiedPaths().includes('active'))
    return 'Delete';

  if (options.op) return options.op;
  return 'Update';
};

module.exports = (schema) => {
  /**
   * @NOTE
   * Async required to handle thrown error.
   */
  async function checkOp(fn, options = {}) {
    const user = extractUser(this);
    const { collection } = this;

    if (this.isNew && user) this.createdBy = user._id;
    if (!collection) return;

    const { collectionName } = this.collection;
    const acResult = new Grant(user)
      .can(getOp(this, options))
      .on(collectionName)
      .test(this.toJSON());

    fn(
      reportAccessLevelFailure(
        hasOptions(options) &&
          (!acResult || acResult === undefined),
      ),
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
      ownershipAliasesOnly = false,
      ownershipAliasesWith = false,
      ownershipAliases = [],
      documentConditions = [],
    } = doc;

    const { $and } = new Comparison(
      documentConditions,
    ).query();

    if ($and.length) this.and($and);

    if (ownership !== 'Any') {
      const aliases = ownershipAliases.map(
        ({ foreign, local, cast }) => {
          const q = get(user, foreign);

          // for now, we've only encountered ObjectId references
          // we may need to support other caster functions/presets later
          if (cast === 'ObjectId')
            return {
              $expr: {
                $eq: [{ $toString: `$${local}` }, q],
              },
            };

          return {
            [local]: q,
          };
        },
      );
      if (aliases.length) {
        if (ownershipAliasesOnly) {
          this.or(aliases);
        } else if (ownershipAliasesWith) {
          this.and(
            aliases.concat({
              createdBy,
            }),
          );
        } else {
          this.or(
            aliases.concat({
              createdBy,
            }),
          );
        }
      } else {
        this.where({
          createdBy,
        });
      }
    }
  }

  if (schema.options.enableOwnership) {
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
