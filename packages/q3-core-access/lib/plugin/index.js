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
const {
  meetsUserRequirements,
  hasOptions,
} = require('../helpers');
const AccessControlSessionBridge = require('./sessionBridge');
const QueryDecorators = require('./queryDecorators');
const MethodDecorators = require('./methodDecorators');

const enforce = (fn) =>
  function () {
    if (isFunction(this.setOptions))
      this.setOptions({
        redact: true,
      });

    return fn.call(this);
  };

module.exports = (schema) => {
  async function checkOp(fn, options = {}) {
    this.assignCreatedBy();

    fn(
      hasOptions(options) && !this.checkGrantExists()
        ? exception('Authorization')
            .msg('insufficientAccessLevels')
            .boomerang()
        : undefined,
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
