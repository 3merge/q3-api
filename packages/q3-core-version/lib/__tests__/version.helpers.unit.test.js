const {
  insertToPatchHistory,
  getUserMeta,
  getCollectionName,
  diff,
} = require('../helpers');

describe('Version helpers', () => {
  describe('"getUserMeta"', () => {
    it('should return null', () =>
      expect(getUserMeta()).toEqual({}));

    it('should return first/last name', () =>
      expect(
        getUserMeta({
          __$q3: {
            USER: { firstName: 'Joe', lastName: 'Doe' },
          },
        }),
      ).toMatchObject({
        firstName: 'Joe',
        lastName: 'Doe',
      }));
  });

  describe('"getCollectionName"', () => {
    it('should name', () =>
      expect(
        getCollectionName({
          constructor: {
            collection: { collectionName: 'foo' },
          },
        }),
      ).toMatch('foo'));
  });

  describe('"insertToPatchHistory"', () => {
    it('should create a new collection', () => {
      const insertOne = jest.fn();
      const collection = jest.fn();

      insertToPatchHistory(
        {
          connection: {
            db: {
              collection: collection.mockReturnValue({
                insertOne,
              }),
            },
          },
        },
        'foo',
        { op: 1 },
      );

      expect(insertOne).toHaveBeenCalledWith({ op: 1 });
      expect(collection).toHaveBeenCalledWith(
        'foo-patch-history',
      );
    });
  });

  describe('"difference"', () => {
    it('should serve nested key differences', () => {
      const output = diff(
        {
          foo: 2,
          bar: {
            quuz: 1,
            garply: 2,
            thunk: [1, 2],
            deeper: {
              retain: true,
              truthy: false,
            },
          },
        },
        {
          foo: 1,
          bar: {
            quuz: 1,
            garply: 1,
            thunk: [1, 2, 3],
            deeper: {
              retain: true,
              truthy: true,
            },
          },
        },
      );

      expect(output).toHaveProperty('foo', 2);
      expect(output.bar).not.toHaveProperty('quuz');
      expect(output.bar.thunk).toHaveLength(2);
      expect(output.bar.deeper.truthy).toBeFalsy();
      expect(output.bar.deeper.retain).toBeUndefined();
    });
  });
});
