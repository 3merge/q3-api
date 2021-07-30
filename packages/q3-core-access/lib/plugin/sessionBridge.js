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
} = require('lodash');
const micromatch = require('micromatch');
const { exception } = require('q3-core-responder');
const Redact = require('../core/redact');
const Grant = require('../core/grant');
const {
  extractUser,
  clean,
  hasKeys,
  concat,
} = require('../helpers');

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

  __$getInitialGrantAndContext(op) {
    const user = this.__$getUserFromSession();
    const fullDocument = this.toJSON();

    const options = {
      includeConditionalGlobs: true,
      user,
    };

    const grant = new Grant(user)
      .can(op)
      .on(this.__$getCollectionName())
      .test(fullDocument, options);

    if (!isObject(grant))
      exception('Authorization')
        .msg('missingGrant')
        .throw();

    const getGrantPatterns = () =>
      Redact.flattenAndReduceByFields(fullDocument, grant, {
        returnWithPatternsEarly: true,
        ...options,
      });

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
      this.__$getInitialGrantAndContext(op);

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
    const field = this.$__.fullPath;
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
    const field = this.$__.fullPath;
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
