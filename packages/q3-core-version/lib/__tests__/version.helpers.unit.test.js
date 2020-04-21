const {
  insertToPatchHistory,
  getUserMeta,
  getCollectionName,
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
});
