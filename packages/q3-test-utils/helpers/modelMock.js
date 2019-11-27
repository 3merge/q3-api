const Model = {};

[
  'exec',
  'find',
  'findOne',
  'lean',
  'save',
  'select',
  'setOptions',
  'validate',
].forEach((name) => {
  Model[name] = jest.fn().mockReturnValue(Model);
});

Model.reset = () =>
  Object.values(Model).forEach((method) => {
    if (typeof method === 'object' && 'mockReset' in method)
      method.mockReset();
  });

module.exports = Model;
