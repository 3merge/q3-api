/* eslint-disable func-names */
const Comparison = require('comparisons');
const mongoose = require('mongoose');
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

  Grant.hasBeenInterpreted = true;

  Grant.makeOwnershipQuery = function () {
    const aliases = compact(
      map(
        this.ownershipAliases,
        ({
          cast,
          documentConditions:
            ownershipAliasDocumentConditions,
          foreign,
          local,
        }) => {
          const q = get(currentUser, foreign);

          const oadc = reduceConditionsIntoObject(
            ownershipAliasDocumentConditions,
          );

          const withSubOwnershipAliasConditions = (
            data,
          ) => ({
            ...oadc,
            ...data,
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
      ),
    );

    if (this.ownershipAliasesWith)
      return {
        operator: 'AND',
        data: aliases.concat({
          createdBy,
        }),
      };

    if (this.ownershipAliasesOnly)
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

  return Grant;
};
