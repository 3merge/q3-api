jest.mock('mongoose', () => ({
  models: {
    tests: {
      collection: {
        collectionName: 'test',
      },
      watch: jest.fn().mockReturnValue({
        on: jest
          .fn()
          // eslint-disable-next-line
          .mockImplementation(function (eventName, next) {
            if (eventName === 'change')
              next({
                documentKey: {
                  _id: 1,
                },
              });

            return this;
          }),
      }),
    },
  },
}));

const DatabaseStream = require('../databaseStream');

describe('DatabaseStream', () => {
  it('should emit event on refresh', (done) => {
    const ev = new DatabaseStream();
    ev.onRefresh((args) => {
      expect(args).toHaveProperty('collection', 'test');
      expect(args).toHaveProperty('id', 1);
      done();
    });

    ev.init();
  });

  describe('isNoop', () => {
    it('should return false on non-update ops', () => {
      expect(
        DatabaseStream.utils.isNoop({
          operationType: 'insert',
        }),
      ).toBeFalsy();
    });

    it('should return false on update ops without descriptions', () => {
      expect(
        DatabaseStream.utils.isNoop({
          operationType: 'update',
        }),
      ).toBeFalsy();
    });

    it('should return false on update ops with something defined', () => {
      expect(
        [
          {
            removedFields: [1],
          },
          {
            truncatedArrays: [1],
          },
          {
            removedFields: [1],
            truncatedArrays: [1],
          },
          {
            updatedFields: {
              cost: 1,
            },
          },
        ].every((updateDescription) =>
          DatabaseStream.utils.isNoop({
            operationType: 'update',
            updateDescription,
          }),
        ),
      ).toBeFalsy();
    });

    it('should return truthy on update ops with nothing defined', () => {
      expect(
        DatabaseStream.utils.isNoop({
          operationType: 'update',
          updateDescription: {
            removedFields: [],
            truncatedArrays: [],
            updatedFields: {
              updatedAt: 1,
            },
          },
        }),
      ).toBeTruthy();
    });
  });
});
