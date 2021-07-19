const mung = require('express-mung');
const { kill } = require('q3-core-session');
const { Redact } = require('q3-core-access');
const { isObject, get } = require('lodash');
const {
  mapAsync,
  moveWithinPropertyName,
} = require('../utils');

module.exports = mung.jsonAsync(async (body, req) => {
  const { locals, redactions, user } = req;

  const decorateWithLocals = (activeDocument) => {
    const fullParentDocument = get(
      locals,
      'fullParentDocument',
    );

    const exec = (xs) =>
      isObject(fullParentDocument) && isObject(xs)
        ? {
            ...fullParentDocument,
            ...xs,
          }
        : xs;

    return Array.isArray(activeDocument)
      ? activeDocument.map(exec)
      : exec(activeDocument);
  };

  await mapAsync(
    redactions,
    async ({ collectionName, locations }) => {
      const select = get(locations, 'prefix');

      const execRedactFn = async (data) => {
        const baseInput = moveWithinPropertyName(
          select,
          data,
        );

        const baseOutput = await Redact(
          decorateWithLocals(baseInput),
          user,
          collectionName,
        );

        return get(baseOutput, select, baseOutput);
      };

      return mapAsync(
        get(locations, 'response'),
        async (item) =>
          /**
           * @note
           * When "isRequest" is truthy,
           * then mutable equals the req object.
           */
          Object.assign(body, {
            [item]: await execRedactFn(body[item]),
          }),
      );
    },
  );

  kill();
  return body;
});
