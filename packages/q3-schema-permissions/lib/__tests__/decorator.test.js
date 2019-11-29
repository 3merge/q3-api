const Decorator = require('../decorators');
const StatementReader = require('../utils');

describe('StatementReader', () => {
  it('should return truthy', () => {
    const readers = new StatementReader([
      'foo = bar',
      'color=red',
      'age=21',
      'bool=false',
      'stranger=!123Hh',
    ]);

    expect(
      readers.compare({
        foo: 'bar',
        color: 'RED',
        age: 21,
        bool: false,
        stranger: '!123Hh',
      }),
    ).toBeTruthy();
  });

  it('should return falsy', () => {
    const readers = new StatementReader([
      'bool=true',
      'stranger=23',
    ]);

    expect(
      readers.compare({
        bool: true,
      }),
    ).toBeFalsy();
  });
});

describe('Decorator', () => {
  it('should throw an error on missing user', () => {
    const deco = new Decorator();
    expect(() =>
      deco.testOwnership.call({
        ownershipConditions: ['foo=bar'],
      }),
    ).toThrowError();
  });

  it('should do nothing', () => {
    const deco = new Decorator();
    expect(
      deco.testOwnership.call({
        ownershipConditions: [],
      }),
    ).toBeUndefined();
  });

  it('should throw an error on unmet condition', () => {
    const deco = new Decorator();
    expect(() =>
      deco.testOwnership.call(
        {
          ownershipConditions: ['foo=bar'],
        },
        { foo: 'quuz' },
      ),
    ).toThrowError();
  });

  it('should pass condition', () => {
    const deco = new Decorator();
    expect(
      deco.testOwnership.call(
        {
          ownershipConditions: ['foo=bar'],
        },
        { foo: 'bar' },
      ),
    ).toBeUndefined();
  });
});
