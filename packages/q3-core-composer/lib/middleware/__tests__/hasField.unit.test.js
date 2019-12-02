const mongoose = require('mongoose');
const getRequired = require('../hasField');

const name = 'Testing';

beforeAll(() => {
  mongoose.model(
    name,

    new mongoose.Schema({
      food: String,
      doc: new mongoose.Schema({
        date: Date,
        number: {
          type: Number,
          required: true,
        },
      }),
      embedded: [
        new mongoose.Schema({
          colour: {
            type: String,
            required: true,
          },
          age: Number,
        }),
      ],
    }),
  );
});

describe('hasField', () => {
  it('should return the path on error', () => {
    expect(getRequired('foo', 'bar')).toMatch('bar');
  });

  it('should return the path if it is not embedded', () => {
    expect(getRequired(name, 'food')).toMatch('food');
  });

  it('should return required path array on embedded arrays', () => {
    expect(getRequired(name, 'embedded')).toEqual([
      'embedded.colour',
    ]);
  });

  it('should return required path array on simple docs', () => {
    expect(getRequired(name, 'doc')).toEqual([
      'doc.number',
    ]);
  });
});
