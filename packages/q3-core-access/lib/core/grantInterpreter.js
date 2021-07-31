/* eslint-disable func-names */
const Comparison = require('comparisons');
const mongoose = require('mongoose');
const { compose } = require('lodash/fp');
const {
  compact,
  get,
  map,
  invoke,
  size,
} = require('lodash');

const reduceConditionsIntoObject = (xs) =>
  size(xs)
    ? get(new Comparison(xs).query(), '$and', []).reduce(
        (acc, curr) => Object.assign(acc, curr),
        {},
      )
    : {};

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

  Grant.makeOwnershipQuery = function (options = {}) {
    const pipeline = compose(defineAliasData, compact, map);
    const mongo = get(options, 'mongo', true);

    return pipeline(
      this.ownershipAliases,
      ({ cast, documentConditions, foreign, local }) => {
        const q = get(currentUser, foreign);
        const oadc = reduceConditionsIntoObject(
          documentConditions,
        );

        const withSubOwnershipAliasConditions = (data) => ({
          ...oadc,
          [local]: data,
        });

        const getAsObjectId = () =>
          withSubOwnershipAliasConditions(
            mongoose.Types.ObjectId(q),
          );

        const getAsObjectIdString = () =>
          withSubOwnershipAliasConditions(
            typeof q === 'object'
              ? invoke(q, 'toString')
              : q,
          );

        const castToObjectId = () =>
          mongo
            ? {
                $or: [
                  getAsObjectId(),
                  getAsObjectIdString(),
                ],
              }
            : getAsObjectId();

        try {
          return get(
            {
              ObjectId: castToObjectId,
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
