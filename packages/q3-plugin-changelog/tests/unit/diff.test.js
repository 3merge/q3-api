const diff = require('../../lib/diff');
const fixture = require('../fixtures/sample-order.json');

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
        foo: 'baz',
      },
      previous: {
        foo: 'bar',
      },
    });

    checkFor({
      updated: {
        'items.foo': 'bar',
      },
      previous: {
        'items.foo': 'bar1',
      },
    });

    checkFor({
      deleted: {
        'items.foo': 'bar',
      },
    });

    checkFor({
      added: {
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
        'items.foo': 'fuz',
      },
      previous: {
        'items.foo': 'foo',
        'items.bar': 'bar',
      },
    });

    checkFor({
      updated: {
        'items.quuz.ignore': 2,
      },
      previous: {
        'items.quuz.ignore': 1,
      },
    });
  });

  it('should merge updated and additions to sub-docs', () => {
    const effectiveFrom = new Date();
    const differences = diff(
      {
        _id: 1,
        items: [
          {
            _id: 1,
            claim: {
              program: '',
            },
          },
        ],
      },
      {
        _id: 1,
        items: [
          {
            _id: 1,
            claim: {
              program: 'ABC',
              currency: 'CAD',
            },
            effectiveFrom,
          },
        ],
      },
    );

    const checkFor = expectArrayToContain(differences);
    expect(differences).toHaveLength(1);

    checkFor({
      previous: {
        'items.claim.program': '',
      },
      updated: {
        'items.claim.program': 'ABC',
        'items.claim.currency': 'CAD',
        'items.effectiveFrom': effectiveFrom.toISOString(),
      },
    });
  });

  it('should detect single difference', () => {
    const differences = diff(fixture.before, fixture.after);
    expect(differences).toHaveLength(1);
  });
});
