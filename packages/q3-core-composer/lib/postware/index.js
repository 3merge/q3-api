const mung = require('express-mung');
const { kill } = require('q3-core-session');
const { Redact } = require('q3-core-access');
const { get } = require('lodash');
const {
  hasLength,
  isTargettingRequest,
  mapAsync,
  moveWithinPropertyName,
  pickByTargetObject,
  removeReservedKeys,
  toJSON,
} = require('../utils');

const runRedaction = async (req, mutable, initalTarget) => {
  const { redactions, user } = req;

  const exec = (currentTarget) => (context = {}) =>
    mapAsync(
      redactions,
      async ({ collectionName, locations, grant }) => {
        const select = get(locations, 'prefix');

        const execRedactFn = async (data) => {
          const baseInput = moveWithinPropertyName(
            select,
            data,
          );

          const fullInput = Array.isArray(baseInput)
            ? baseInput
            : {
                ...toJSON(context),
                ...baseInput,
              };

          return pickByTargetObject(
            isTargettingRequest(currentTarget)
              ? await Redact.flattenAndReduceByFields(
                  fullInput,
                  grant,
                  {
                    includeConditionalGlobs: !hasLength(
                      context,
                    ),
                  },
                )
              : await Redact(
                  fullInput,
                  user,
                  collectionName,
                ),
            baseInput,
            {
              clean: true,
              select,
            },
          );
        };

        return mapAsync(
          get(locations, currentTarget),
          async (item) =>
            /**
             * @note
             * When "isRequest" is truthy,
             * then mutable equals the req object.
             */
            Object.assign(mutable, {
              [item]: await execRedactFn(mutable[item]),
            }),
        );
      },
    );

  /**
   * @note
   * We've attached this function to the request object
   * so that we may call it in Patch operations.
   * Now that q3-core-access supports dynamic grants,
   * we need the ability to run Redact with the documents post DB query.
   */
  req.rerunRedactOnRequestBody = exec('request');
  await exec(initalTarget)();
  return req;
};

exports.request = async (req, res, next) => {
  removeReservedKeys(req.body);
  await runRedaction(req, req, 'request');
  next();
};

exports.response = mung.jsonAsync(async (body, req) => {
  await runRedaction(req, body, 'response');

  kill();
  return body;
});
