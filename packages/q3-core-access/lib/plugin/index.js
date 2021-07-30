/* eslint-disable no-param-reassign, func-names */
const {
  get,
  invoke,
  lowerCase,
  isFunction,
  compact,
} = require('lodash');
const Comparison = require('comparisons');
const mongoose = require('mongoose');
const { exception } = require('q3-core-responder');
const Grant = require('../core/grant');
const {
  meetsUserRequirements,
  hasOptions,
} = require('../helpers');
const AccessControlSessionBridge = require('./sessionBridge');
const QueryDecorators = require('./queryDecorators');
const MethodDecorators = require('./methodDecorators');

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
    const user = this.__$getUserFromSession();
    const userId = get(user, '_id');

    if (this.isNew && user) this.createdBy = userId;
    if (!collectionName) return;

    const isEmpty = (xs) => !xs || xs === undefined;

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
        hasOptions(options) && isEmpty(acResult),
      ),
    );
  }

  function useQuery() {
    if (!hasOptions(this)) return;

    const doc = this.getReadGrant();

    const user = this.getActiveUser();
    const createdBy = get(user, '_id', null);

    const { ownership, documentConditions } = doc;

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

    if (ownership !== 'Any' && doc.hasBeenInterpreted) {
      const { operator, data } = doc.makeOwnershipQuery();

      if (operator) {
        invoke(this, lowerCase(operator), data);
      } else {
        this.where({
          createdBy,
        });
      }
    }
  }

  schema.loadClass(AccessControlSessionBridge);
  schema.loadClass(MethodDecorators);
  schema.plugin(QueryDecorators);

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
