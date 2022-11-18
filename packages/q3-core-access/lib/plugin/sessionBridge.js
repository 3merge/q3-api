/* eslint-disable no-param-reassign, func-names */
const {
  get,
  invoke,
  isObject,
  pick,
  first,
  size,
  omit,
  map,
  isEqual,
  isString,
  isNil,
  includes,
} = require('lodash');
const micromatch = require('micromatch');
const sift = require('sift');
const { exception } = require('q3-core-responder');
const Redact = require('../core/redact');
const Grant = require('../core/grant');
const {
  extractUser,
  clean,
  hasKeys,
  concat,
  invokeJSON,
} = require('../helpers');

const forward = (xs) => (fn) => fn(xs);

const getFirstInPath = (str) =>
  isString(str) ? first(str.split('.')) : undefined;

const removeSpecialProps = (xs) =>
  omit(xs, [
    '_id',
    'id',
    'updatedAt',
    'createdAt',
    'createdBy',
    'lastModifiedBy',
  ]);

const checkSizeOf = (args) => {
  if (!hasKeys(args))
    exception('Authorization')
      .msg('emptyOperationDetected')
      .throw();

  return args;
};

const cleanAndPick = (a, b) =>
  checkSizeOf(
    isObject(b)
      ? clean(pick(a, Object.keys(removeSpecialProps(b))))
      : clean(a),
  );

const depopulateCreatedByReference = (xs) =>
  isObject(xs.createdBy) && 'firstName' in xs.createdBy
    ? xs.createdBy._id
    : xs.createdBy;

const getAccessFieldError = () =>
  exception('Authorization')
    .msg('cannotAccessField')
    .boomerang();

class AccessControlSessionBridge {
  __$getCollectionName() {
    return get(this, 'collection.collectionName');
  }

  __$getUserFromSession() {
    return extractUser(
      invoke(this, 'getSessionVariables') ||
        this.parent() ||
        this,
    );
  }

  getCrudOperationName() {
    if (this.isNew) return 'Create';
    if (this.modifiedPaths().includes('active'))
      return 'Delete';

    if (this.op) return this.op;
    return 'Update';
  }

  assignCreatedBy() {
    const user = this.__$getUserFromSession();
    const userId = get(user, '_id');

    if (this.isNew && userId && !this.createdBy)
      this.createdBy = userId;
  }

  enforceOwnership() {
    const op = this.getCrudOperationName();

    return (
      (op === 'Create' && this.isNew) ||
      (op === 'Delete' &&
        this.isModified('active') &&
        !this.active)
    );
  }

  checkGrantExists() {
    if (!this.__$getCollectionName()) return true;
    const op = this.getCrudOperationName();

    return !isNil(
      get(
        this.__$getInitialGrantAndContext(op, {
          ensureIdIsAvailable: this.enforceOwnership(op),
          noThrow: op !== 'Delete',
        }),
        'grant',
      ),
    );
  }

  __$getInitialGrantAndContext(op, extendedOptions = {}) {
    const user = this.__$getUserFromSession();
    const fullDocument = this.toJSON();

    const options = {
      ...extendedOptions,
      includeConditionalGlobs: true,
      user,
    };

    const grant = new Grant(user)
      .can(op)
      .on(this.__$getCollectionName())
      .test(
        get(extendedOptions, 'marshal')
          ? extendedOptions.marshal(fullDocument)
          : fullDocument,
        options,
      );

    const getGrantPatterns = () =>
      Redact.flattenAndReduceByFields(fullDocument, grant, {
        returnWithPatternsEarly: true,
        ...options,
      });

    if (
      (!isObject(grant) ||
        !this.checkOwnership(grant) ||
        // mainly applies to DELETE ops
        (includes(getGrantPatterns(), '!_id') &&
          extendedOptions.ensureIdIsAvailable)) &&
      !get(extendedOptions, 'noThrow', false)
    )
      exception('Authorization')
        .msg('missingOrIncompleteGrant')
        .throw();

    return {
      grant,
      fullDocument,
      options,
      getGrantPatterns,

      checkFieldAgainst(field) {
        return (
          size(micromatch([field], getGrantPatterns())) > 0
        );
      },

      getIndexOfSubField(field, id) {
        try {
          return String(
            get(fullDocument, field, []).findIndex((item) =>
              id.equals(item._id),
            ) || 0,
          );
        } catch (e) {
          return String(0);
        }
      },
    };
  }

  __$runGrantAgainstDocument(args, op = 'Update') {
    const { fullDocument, grant, options } =
      this.__$getInitialGrantAndContext(op, {
        marshal:
          // This is a weird workaround that only affects Create ops
          // When documentConditions are present, we need the args
          // in case the incoming data satisifies what the default document does not have
          op === 'Create'
            ? (xs) => ({
                ...xs,
                ...args,
              })
            : undefined,
      });

    const modifiedDocument = {
      ...fullDocument,
      ...args,
    };

    if (!this.isNew)
      grant.fields = Redact.flattenAndReduceByFields(
        fullDocument,
        grant,
        {
          returnWithPatternsEarly: true,
          ...options,
        },
      );

    return cleanAndPick(
      Redact.flattenAndReduceByFields(
        modifiedDocument,
        grant,
        options,
      ),
      args,
    );
  }

  __$resolveFullPath() {
    const path = get(this, '$__.fullPath');

    if (this.$isSubdocument) {
      // calling this populates $__.fullPath
      invoke(this, '$__fullPath');

      return (
        path ||
        getFirstInPath(
          invoke(this, '$__pathRelativeToParent'),
        )
      );
    }

    return path;
  }

  authorizeCreateArguments(args = {}) {
    return this.__$runGrantAgainstDocument(args, 'Create');
  }

  authorizeDeleteArguments(args = {}) {
    return this.__$runGrantAgainstDocument(args, 'Delete');
  }

  authorizeUpdateArguments(args = {}) {
    return this.__$runGrantAgainstDocument(args, 'Update');
  }

  authorizeUpdateArgumentsOnCurrentSubDocument(args) {
    let index = 0;
    const field = this.__$resolveFullPath();
    const parent = this.parent();

    const newSubDoc = {
      ...this.toJSON(),
      ...args,
    };

    const modifiedDocument = {
      [field]: map(get(parent, field), (item, i) => {
        if (this._id.equals(item._id)) {
          index = i;
          return newSubDoc;
        }

        return item.toJSON();
      }),
    };

    const redactedSubDocument = get(
      parent.authorizeUpdateArguments(modifiedDocument),
      concat([field, index]),
    );

    return this.set(
      cleanAndPick(redactedSubDocument, args),
    );
  }

  authorizeRemovalOnCurrentSubDocument(callback) {
    const field = this.__$resolveFullPath();
    const { checkFieldAgainst, getIndexOfSubField } =
      this.parent().__$getInitialGrantAndContext('Delete');

    return checkFieldAgainst(
      concat([field, getIndexOfSubField(field, this._id)]),
    )
      ? this.remove(callback)
      : callback(getAccessFieldError());
  }

  checkAuthorizationForTotalSubDocument(
    field,
    op = 'Delete',
  ) {
    if (
      !this.__$getInitialGrantAndContext(
        op,
      ).checkFieldAgainst(field)
    )
      throw getAccessFieldError();

    return true;
  }

  isOwner() {
    const creator = depopulateCreatedByReference(this);
    const user = this.__$getUserFromSession();
    const id = get(user, '_id');

    try {
      return creator.equals(id);
    } catch (e) {
      return isEqual(id, creator);
    }
  }

  checkOwnership(grant) {
    if (
      !grant ||
      grant.ownership === 'Any' ||
      !['Delete', 'Update'].includes(grant.op)
    )
      return true;

    const { data, operator } = grant.makeOwnershipQuery();

    const siftPipeline = map(data, sift);
    const siftCallback = forward({
      ...invokeJSON(this),
      createdBy: depopulateCreatedByReference(this),
    });

    if (operator === 'OR') {
      return siftPipeline.some(siftCallback);
    }

    if (operator === 'AND') {
      return siftPipeline.every(siftCallback);
    }

    return this.isOwner();
  }
}

// make sure arguments are always included before checking
// permission levels
[
  'authorizeCreateArguments',
  'authorizeDeleteArguments',
  'authorizeUpdateArguments',
  'authorizeUpdateArgumentsOnCurrentSubDocument',
].forEach((method) => {
  const fn = AccessControlSessionBridge.prototype[method];
  AccessControlSessionBridge.prototype[method] = function (
    ...params
  ) {
    const isEmptyUpdate = !hasKeys(
      removeSpecialProps(first(params)),
    );

    return !isEmptyUpdate ? fn.call(this, ...params) : this;
  };
});

module.exports = AccessControlSessionBridge;
