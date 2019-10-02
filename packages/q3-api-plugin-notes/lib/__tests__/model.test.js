const model = require('../model');

describe('Model creation', () => {
  const followSchemaPaths = (name, expected) => {
    const {
      obj: { thread },
    } = model(name);
    expect(thread[0].author).toHaveProperty(
      'ref',
      expected,
    );
  };

  it('should use the default user ref', () => {
    followSchemaPaths(undefined, 'q3-users');
  });

  it('should overwrite default user ref', () => {
    followSchemaPaths('demo', 'demo');
  });
});
