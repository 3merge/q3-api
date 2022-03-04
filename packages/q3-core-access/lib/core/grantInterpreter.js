/* eslint-disable func-names */
const Comparison = require('comparisons');
const mongoose = require('mongoose');
const { compose } = require('lodash/fp');
const {
  compact,
  get,
  map,
  invoke,
  isObject,
} = require('lodash');
const { makeSessionPayload } = require('../helpers');

module.exports = function GrantInterpreter(
  xs,
  currentUser,
) {
  if (!xs) return null;
  const Grant = { ...xs };
  const createdBy = get(currentUser, '_id', null);

  const defineAliasData = (aliases = []) => {
    if (Grant.ownershipAliasesWith)
      return {
        operator: 'AND',
        data: aliases.concat({
          createdBy,
        }),
      };

    if (Grant.ownershipAliasesOnly)
      return {
        operator: 'AND',
        data: aliases,
      };

    return {
      operator: 'OR',
      data: aliases.concat({
        createdBy,
      }),
    };
  };

  Grant.makeOwnershipQuery = function () {
    const pipeline = compose(defineAliasData, compact, map);

    return pipeline(
      this.ownershipAliases,
      ({ cast, documentConditions, foreign, local }) => {
        const q = get(currentUser, foreign);

        const withSubOwnershipAliasConditions = (data) => ({
          ...(Comparison.isAcceptableParam(
            documentConditions,
          )
            ? new Comparison(documentConditions).query(
                makeSessionPayload(),
              )
            : {}),
          [local]: data,
        });

        try {
          return get(
            {
              ObjectId: () =>
                withSubOwnershipAliasConditions({
                  $in: [
                    mongoose.Types.ObjectId(q),
                    isObject(q) ? invoke(q, 'toString') : q,
                  ],
                }),
            },
            cast,
          )();
        } catch (e) {
          return withSubOwnershipAliasConditions(q);
        }
      },
    );
  };

  Grant.hasBeenInterpreted = true;
  return Grant;
};
