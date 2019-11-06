require('..');
const mongoose = require('mongoose');
const validate = require('mongoose-validator');

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
          type: String,
          required: true,
          unique: false,
          validate: validate({
            validator: 'isEmail',
          }),
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

test('Should read...', () => {
  const { paths } = Model.getValidation();
});
