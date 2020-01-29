const mongoose = require('mongoose');
const Controller = require('../utils');

describe('Utility functions', () => {
  describe('getColumnsHeadersFromPayload', () => {
    it('should flatten the object', () => {
      expect(
        Controller.getColumnsHeadersFromPayload([
          { foo: '', bar: '' },
        ]),
      ).toEqual(['foo', 'bar']);
    });

    it('should use dot notation for deeply nested properties', () => {
      expect(
        Controller.getColumnsHeadersFromPayload([
          {
            foo: {
              bar: '',
              quuz: {
                garply: '',
              },
            },
          },
        ]),
      ).toEqual(['foo.bar', 'foo.quuz.garply']);
    });
  });

  describe('populateEmptyObjectKeys', () => {
    it('should ensure consistent object structure in the array', () => {
      expect(
        Controller.populateEmptyObjectKeys(
          [{ foo: 1, bar: 1, garply: 1 }],
          ['foo', 'bar', 'quuz', 'garply'],
        ),
      ).toEqual([{ foo: 1, bar: 1, quuz: '', garply: 1 }]);
    });
  });

  describe('transformArraysInDotNotation', () => {
    it('should transform arrays in dot notation to $', () => {
      const next = jest.fn();
      Controller.transformArraysInDotNotation(
        [{ 'foo.1.bar': 1 }],
        next,
      );

      expect(next).toHaveBeenCalledWith('foo.$.bar');
    });
  });

  describe('pick', () => {
    it('should parse object for specific keys', () => {
      expect(
        Controller.pick({ foo: 1, bar: 1 }, ['foo']),
      ).toMatchObject({ foo: 1 });
    });
  });

  describe('isObjectId', () => {
    it('should return unmodified', () =>
      expect(
        Controller.castObjectIds({ foo: 'Bar' }),
      ).toMatchObject({ foo: 'Bar' }));

    it('should return modified', () =>
      expect(
        Controller.castObjectIds({
          foo: `ObjectId(${mongoose.Types.ObjectId().toString()})`,
        }),
      ).toMatchObject({
        foo: expect.any(Object),
      }));
  });
});
