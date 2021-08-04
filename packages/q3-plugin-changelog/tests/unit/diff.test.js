const diff = require('../../lib/diff');

const expectArrayToContain =
  (xs = []) =>
  (expectedOutput = {}) =>
    expect(xs).toEqual(
      expect.arrayContaining([expectedOutput]),
    );

describe('diff', () => {
  it('should detect all differences', () => {
    const differences = diff(
      {
        _id: 1,
        foo: 'bar',
        items: [
          {
            _id: 1,
            foo: 'bar',
          },
          {
            _id: 2,
            foo: 'bar1',
          },
        ],
      },
      {
        _id: 1,
        foo: 'baz',
        items: [
          {
            _id: 2,
            foo: 'bar',
          },
          {
            _id: 3,
            foo: 'quuz',
          },
        ],
      },
    );

    const checkFor = expectArrayToContain(differences);
    expect(differences).toHaveLength(4);

    checkFor({
      updated: {
        _id: 1,
        foo: 'baz',
      },
    });

    checkFor({
      updated: {
        'items._id': 2,
        'items.foo': 'bar',
      },
    });

    checkFor({
      deleted: {
        'items._id': 1,
        'items.foo': 'bar',
      },
    });

    checkFor({
      added: {
        'items._id': 3,
        'items.foo': 'quuz',
      },
    });
  });
});
