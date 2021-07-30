/* eslint-disable no-param-reassign, func-names */
const {
  get,
  invoke,
  isEqual,
  isFunction,
  compact,
  size,
  isObject,
} = require('lodash');
const Comparison = require('comparisons');
const mongoose = require('mongoose');
const { exception } = require('q3-core-responder');
const Grant = require('./core/grant');
const {
  meetsUserRequirements,
  hasOptions,
  extractUser,
} = require('./helpers');
const AccessControlSessionBridge = require('./pluginTemp/bridge');

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

const enforce = (fn) =>
  function () {
    if (isFunction(this.setOptions))
      this.setOptions({
        redact: true,
      });

    return fn.call(this);
  };

const reduceConditionsIntoObject = (xs) =>
  size(xs)
    ? get(new Comparison(xs).query(), '$and', []).reduce(
        (acc, curr) => Object.assign(acc, curr),
        {},
      )
    : {};

module.exports = (schema) => {
  /**
   * @NOTE
   * Async required to handle thrown error.
   */
  async function checkOp(fn, options = {}) {
    const collectionName = get(
      this,
      'collection.collectionName',
    );

    const op = getOp(this, options);
    const user = extractUser(this);
    const userId = get(user, '_id');

    if (this.isNew && user) this.createdBy = userId;
    if (!collectionName) return;

    const isEmpty = (xs) => !xs || xs === undefined;

    const isUserTheOwner = () => {
      const creator =
        isObject(this.createdBy) &&
        'firstName' in this.createdBy
          ? this.createdBy._id
          : this.createdBy;

      try {
        return creator.equals(userId);
      } catch (e) {
        return isEqual(userId, creator);
      }
    };

    const hasStrictOwnership = (xs) =>
      ['Delete', 'Update'].includes(op) &&
      get(xs, 'ownership') === 'Own';

    const requiresIdInGrant = () =>
      (op === 'Create' && this.isNew) ||
      (op === 'Delete' &&
        this.isModified('active') &&
        !this.active);

    const acResult = new Grant(user)
      .can(op)
      .on(collectionName)
      .test(this.toJSON(), {
        ensureIdIsAvailable: requiresIdInGrant(),
      });

    fn(
      reportAccessLevelFailure(
        (hasOptions(options) && isEmpty(acResult)) ||
          (hasStrictOwnership(acResult) &&
            !isUserTheOwner()),
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

    const doc =
      new Grant(user)
        .can('Read')
        .on(collectionName)
        .first() || {};

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

    if (
      doc.ownershipConditions &&
      !meetsUserRequirements(doc, user)
    )
      this.and({
        // this is a "made up" property that will force the query
        // to return null
        __accessControlLock: new Date(),
      });

    if ($and.length) this.and($and);

    if (ownership !== 'Any') {
      const aliases = ownershipAliases.map(
        ({
          cast,
          documentConditions:
            ownershipAliasDocumentConditions,
          foreign,
          local,
        }) => {
          const q = get(user, foreign);

          const oadc = reduceConditionsIntoObject(
            ownershipAliasDocumentConditions,
          );

          const withSubOwnershipAliasConditions = (xs) => ({
            ...oadc,
            ...xs,
          });

          // for now, we've only encountered ObjectId references
          // we may need to support other caster functions/presets later
          if (cast === 'ObjectId')
            return {
              $or: [
                withSubOwnershipAliasConditions({
                  [local]: mongoose.Types.ObjectId(q),
                }),
                withSubOwnershipAliasConditions({
                  [local]:
                    typeof q === 'object'
                      ? invoke(q, 'toString')
                      : q,
                }),
              ],
            };

          return withSubOwnershipAliasConditions({
            [local]: q,
          });
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

  schema.loadClass(AccessControlSessionBridge);

  if (schema.options.enableOwnership) {
    schema.pre('save', checkOp);
    schema.pre('find', useQuery);
    schema.pre('findOne', useQuery);
    schema.pre('findById', useQuery);
    schema.pre('count', enforce(useQuery));
    schema.pre('countDocuments', enforce(useQuery));
    schema.pre('estimatedDocumentCount', enforce(useQuery));
    schema.pre('distinct', useQuery);

    const userParts = [
      '_id',
      'id',
      'firstName',
      'lastName',
      'email',
      'photo',
      'featuredUpload',
    ];

    schema.add({
      createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        autopopulate: true,
        autopopulateSelect: compact(
          userParts.concat(
            schema.options.createdByAutocompleteProjection,
          ),
        ).join(' '),
        ref: 'q3-api-users',
        systemOnly: true,
        private: true,
      },
    });
  }
};
