jest.mock('mongoose');

const mongoose = require('mongoose');
const Model = require('q3-test-utils/helpers/modelMock');
const EmailCollection = require('../emailCollection');

describe('EmailCollection', () => {
  it('should error', () => {
    mongoose.models = {};
    expect(() => EmailCollection('test')).toThrowError(
      'Unknown model test',
    );
  });

  it('should return MJML response', async () => {
    const expectedOutput =
      '<mjml><mj-raw>Foo</mj-raw></mjml>';

    mongoose.models = {
      foo: Model,
    };

    mongoose.models.foo.exec.mockReturnValue({
      mjml: expectedOutput,
    });

    await expect(
      EmailCollection('foo').getMjml('bar'),
    ).resolves.toMatch(expectedOutput);

    expect(
      mongoose.models.foo.findOne,
    ).toHaveBeenCalledWith({
      name: 'bar',
    });
  });

  it('should return default MJML', async () => {
    mongoose.models = {
      foo: Model,
    };

    mongoose.models.foo.exec.mockReturnValue(null);

    await expect(
      EmailCollection('foo').getMjml('bar'),
    ).resolves.toMatch('<mjml><mj-body></mj-body></mjml>');
  });

  it('should return empty array', async () => {
    mongoose.models = {
      foo: Model,
    };

    mongoose.models.foo.exec.mockReturnValue(null);

    await expect(
      EmailCollection('foo').getTemplates([]),
    ).resolves.toEqual([]);

    expect(mongoose.models.foo.find).not.toHaveBeenCalled();
  });

  it('should return array', async () => {
    mongoose.models = {
      foo: Model,
    };

    mongoose.models.foo.exec.mockReturnValue([
      {
        name: 'foo',
        mjml: 'bar',
      },
    ]);

    await expect(
      EmailCollection('foo').getTemplates(['ABC']),
    ).resolves.toEqual([
      {
        name: 'foo',
        mjml: 'bar',
      },
    ]);

    expect(mongoose.models.foo.find).toHaveBeenCalledWith({
      name: ['ABC'],
    });
  });
});
