/* eslint-disable no-param-reassign, func-names */
const {
  get,
  invoke,
  isObject,
  pick,
  first,
} = require('lodash');
const Redact = require('../core/redact');
const Grant = require('../core/grant');
const { extractUser, clean } = require('../helpers');

const cleanAndPick = (a, b) =>
  isObject(b) ? clean(pick(a, Object.keys(b))) : clean(a);

module.exports = class AccessControlSessionBridge {
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

  __$runGrantAgainstDocument(args, op = 'Update') {
    const user = this.__$getUserFromSession();

    const fullDocument = {
      ...this.toJSON(),
      ...args,
    };

    const options = {
      includeConditionalGlobs: true,
      user,
    };

    const grant = new Grant(user)
      .can(op)
      .on(this.__$getCollectionName())
      .test(fullDocument, options);

    return cleanAndPick(
      Redact.flattenAndReduceByFields(
        fullDocument,
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
    const field = this.$__.fullPath;
    const parent = this.parent();

    const subDoc = {
      [field]: [
        {
          ...this.toJSON(),
          ...args,
        },
      ],
    };

    return this.set(
      cleanAndPick(
        first(
          get(
            parent.authorizeUpdateArguments(subDoc),
            field,
          ),
        ),
        args,
      ),
    );
  }
};
