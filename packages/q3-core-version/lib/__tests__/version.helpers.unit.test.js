const {
  insertToPatchHistory,
  getUserMeta,
  getCollectionName,
} = require('../helpers');

describe('Version helpers', () => {
  describe('"getUserMeta"', () => {
    it('should return null', () =>
      expect(getUserMeta()).toBeNull());

    it('should return first/last name', () =>
      expect(
        getUserMeta({
          __$q3: {
            USER: { firstName: 'Joe', lastName: 'Doe' },
          },
        }),
      ).toMatch('Joe Doe'));
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
    it('should name', () => {
      const insert = jest.fn();
      const collection = jest.fn();

      insertToPatchHistory(
        {
          connection: {
            db: {
              collection: collection.mockReturnValue({
                insert,
              }),
            },
          },
        },
        'foo',
        { op: 1 },
      );

      expect(insert).toHaveBeenCalledWith({ op: 1 });
      expect(collection).toHaveBeenCalledWith(
        'foo-patch-history',
      );
    });
  });
});
