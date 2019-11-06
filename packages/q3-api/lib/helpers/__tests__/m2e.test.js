require('q3-schema-types');
const mongoose = require('mongoose');
const adapter = require('../m2e.adapter');

const { ValidationSchemaMapper } = adapter;

let Model;

beforeAll(() => {
  const Sub = new mongoose.Schema({
    global: String,
  });

  Model = mongoose.model(
    'foos',
    new mongoose.Schema(
      {
        email: {
          type: mongoose.Schema.Types.Email,
          required: true,
          unique: false,
        },
        nest: {
          type: Sub,
        },
        arr: {
          type: [Sub],
        },
      },
      {
        discriminatorKey: 'kind',
      },
    ),
  );

  Model.discriminator(
    'bars',
    new mongoose.Schema({
      lastName: String,
      nests: {
        type: [Sub],
      },
    }),
  );

  Model.discriminator(
    'quuxs',
    new mongoose.Schema({
      age: Number,
    }),
  );
});

describe('getValidationType', () => {
  it('should return schema option type', () => {
    expect(
      new ValidationSchemaMapper({
        minLength: 3,
        maxLength: 10,
        enum: ['Foo'],
      }).fromTo('String'),
    ).toMatchObject({
      isLength: { options: { min: 3, max: 10 } },
      isIn: {
        options: [['Foo']],
      },
    });
  });
});
