const {
  executeMiddlewareOnUpdate,
  forEachCollectionAsync,
  markModifiedLocalVars,
} = require('./helpers');
const {
  assembleAutocompleteSchemaPaths,
} = require('./helpers/assemblePaths');
const ReferenceReader = require('./ReferenceReader');

function removeAutopopulateRefs(...params) {
  const next = forEachCollectionAsync(...params);
  return executeMiddlewareOnUpdate(async function () {
    await next((model) => {
      if (!this.active)
        assembleAutocompleteSchemaPaths(model.inst).map(
          async (originalPath) => {
            const reader = ReferenceReader(
              originalPath,
              [],
              this,
            );

            await model.proxyUpdate(
              ...reader.spread(this._id),
            );
          },
        );
    });
  });
}

module.exports = (s, collections = []) => {
  s.pre('save', markModifiedLocalVars);
  s.post('save', removeAutopopulateRefs(collections));
  return s;
};
