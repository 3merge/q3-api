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
});
