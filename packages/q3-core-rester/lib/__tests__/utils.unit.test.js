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
});
