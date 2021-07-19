const Model = {};

[
  'create',
  'update',
  'updateOne',
  'findById',
  'findStrictly',
  'archive',
  'archiveMany',
  'pushSubDocument',
  'removeSubDocument',
  'getSubDocument',
  'updateSubDocument',
  'updateSubDocuments',
  'exec',
  'find',
  'findOne',
  'lean',
  'save',
  'select',
  'setOptions',
  'validate',
  'set',
  'snapshotChange',
  'snapshotChangeOnSubdocument',
  'verifyOutput',
].forEach((name) => {
  Model[name] = jest.fn().mockReturnValue(Model);
});

Model.reset = () =>
  Object.values(Model).forEach((method) => {
    if (
      (typeof method === 'object' ||
        typeof method === 'function') &&
      'mockReset' in method
    )
      method.mockClear();
  });

Model.collection = {
  collectionName: 'foo',
};

Model.schema = {
  childSchemas: [],
  options: {},
  get: jest.fn(),
  set: jest.fn(),
  path: jest.fn(),
};

module.exports = Model;
