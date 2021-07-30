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

    return {
      grant,
      fullDocument,
      options,
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
      [field, index].join('.'),
    );

    return this.set(
      cleanAndPick(redactedSubDocument, args),
    );
  }

  checkAuthorizationForTotalSubDocument(field) {
    const { fullDocument, grant, options } =
      this.__$getInitialGrantAndContext('Delete');

    if (
      !size(
        micromatch(
          [field],
          Redact.flattenAndReduceByFields(
            fullDocument,
            grant,
            {
              returnWithPatternsEarly: true,
              ...options,
            },
          ),
        ),
      )
    )
      exception('Authorization')
        .msg('cannotAccessField')
        .throw();

    return true;
  }
}

// make sure arguments are always included before checking
// permission levels
[
  'authorizeCreateArguments',
  'authorizeUpdateArgumentsOnCurrentSubDocument',
  'authorizeUpdateArguments',
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
