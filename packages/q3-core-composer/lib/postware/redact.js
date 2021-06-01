const { Redact } = require('q3-core-access');
const {
  isFunction,
  isObject,
  get,
  pick,
} = require('lodash');

const clean = (o) => {
  if (Array.isArray(o)) return o.map(clean);
  if (!isObject(o) || o instanceof Date) return o;

  return Object.entries(o).reduce((acc, [key, v]) => {
    if (v !== undefined)
      Object.assign(acc, {
        [key]: clean(v),
      });
    return acc;
  }, {});
};

const toJSON = (xs) => {
  const output = isFunction(get(xs, 'toJSON'))
    ? xs.toJSON()
    : xs;

  return isObject(output) ? output : {};
};

module.exports = async (
  req,
  mutable,
  initialTargetLocation,
) => {
  const { user, redactions } = req;

  if (
    typeof redactions !== 'object' ||
    Object.keys(redactions).length === 0
  )
    return;

  const runAllRedactions = (targetLocation, context = {}) =>
    Promise.all(
      Object.values(redactions).map(async (redaction) => {
        const {
          collectionName,
          locations,
          grant,
        } = redaction;

        const execRedactFn = async (data) => {
          const hasPrefix = locations && locations.prefix;
          const baseInput = hasPrefix
            ? {
                [locations.prefix]: data,
              }
            : data;

          const isRequest = targetLocation === 'request';

          // shape the payload
          const input = {
            ...toJSON(context),
            ...baseInput,
          };

          const output = pick(
            isRequest
              ? await Redact.flattenAndReduceByFields(
                  input,
                  grant,
                )
              : await Redact(input, user, collectionName),
            Object.keys(baseInput),
          );

          const reshaped = hasPrefix
            ? output[locations.prefix]
            : output;

          return isRequest ? clean(reshaped) : reshaped;
        };

        const promises = locations[targetLocation].map(
          async (item) => {
            const original = mutable[item];

            Object.assign(mutable, {
              [item]: await execRedactFn(original),
            });
          },
        );

        return Promise.all(promises);
      }),
    );

  await runAllRedactions(initialTargetLocation);
  req.rerunRedactIn = runAllRedactions;
};
