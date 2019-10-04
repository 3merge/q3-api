const Q3 = require('q3-api');
const mongoose = require('mongoose');
const plugin = require('../plugin');

const modelName = 'Foo';
let doc;

jest.mock('request-context', () => ({
  get: jest.fn().mockReturnValue({
    // eslint-disable-next-line
    id: require('mongoose')
      .Types.ObjectId()
      .toString(),
  }),
}));

beforeAll(async () => {
  Q3.register((app, db) => {
    db.plugin(plugin);
    db.model(
      modelName,
      new mongoose.Schema(
        {
          name: String,
        },
        {
          ownership: true,
        },
      ),
    );
  });

  await Q3.connect();
});

describe('mongoose plugin', () => {
  it('should append createdBy', async () => {
    doc = await Q3.model(modelName).create({
      name: 'Oouu',
    });
    expect(doc).toHaveProperty(
      'createdBy',
      expect.any(Object),
    );
  });

  it('should append ownership method', async () => {
    expect(doc.hasSufficientOwnership()).toBe(undefined);
  });

  it('should throw on insufficient ownership', async () => {
    doc.createdBy = null;
    expect(doc.hasSufficientOwnership).toThrowError();
  });
});
