const {
  executeMiddlewareOnUpdate,
  forEachCollectionAsync,
  markModifiedLocalVars,
} = require('./helpers');
const {
  assembleAutocompleteSchemaPaths,
} = require('./helpers/assemblePaths');
const QueryMaker = require('./helpers/queryMaker');

// WHAT TO DO HERE>..
function removeAutopopulateRefs(...params) {
  const next = forEachCollectionAsync(...params);

  // eslint-disable-next-line
  return executeMiddlewareOnUpdate(async function () {
    await next((model) => {
      if (!this.active)
        assembleAutocompleteSchemaPaths(model.inst).map(
          async (originalPath) => {
            const reader = QueryMaker(
              originalPath,
              [],
              this,
            );

            await model.proxyUpdate(...reader(this._id));
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
