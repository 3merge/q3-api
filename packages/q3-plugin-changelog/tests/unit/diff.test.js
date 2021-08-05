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
      previous: {
        _id: 1,
        foo: 'bar',
      },
    });

    checkFor({
      updated: {
        'items._id': 2,
        'items.foo': 'bar',
      },
      previous: {
        'items._id': 2,
        'items.foo': 'bar1',
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

  it('should include context', () => {
    const differences = diff(
      {
        _id: 1,
        top: 1,
        items: [
          {
            _id: 1,
            foo: 'foo',
            bar: 'bar',
            quuz: [
              {
                _id: 1,
                ignore: 1,
              },
            ],
          },
        ],
      },
      {
        _id: 1,
        top: 1,
        items: [
          {
            _id: 1,
            foo: 'fuz',
            bar: 'bar',
            quuz: [
              {
                _id: 1,
                ignore: 2,
              },
            ],
          },
        ],
      },
    );

    const checkFor = expectArrayToContain(differences);
    expect(differences).toHaveLength(2);

    checkFor({
      updated: {
        'items._id': 1,
        'items.foo': 'fuz',
      },
      previous: {
        'items._id': 1,
        'items.foo': 'foo',
        'items.bar': 'bar',
      },
    });

    checkFor({
      updated: {
        'items.quuz._id': 1,
        'items.quuz.ignore': 2,
      },
      previous: {
        'items.quuz._id': 1,
        'items.quuz.ignore': 1,
      },
    });
  });
});
