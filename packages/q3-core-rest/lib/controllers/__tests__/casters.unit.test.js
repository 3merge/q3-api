const casters = require('../casters');

describe('Casters', () => {
  it('should return truthy', () => {
    expect(casters.exists('true')).toBeTruthy();
  });

  it('should return negated query', () => {
    expect(casters.exists('false')).toMatchObject({
      $ne: true,
    });
  });

  it('should return exists query', () => {
    expect(casters.has('true')).toMatchObject({
      $exists: true,
    });
  });

  it('should return not exists query', () => {
    expect(casters.has('false')).toMatchObject({
      $exists: false,
    });
  });

  test.each([
    ['a,b,c', ['a', 'b', 'c']],
    ['"hello, world",test', ['hello, world', 'test']],
  ])('.in(%s)', (a, b) => {
    expect(casters.in(a)).toEqual(b);
  });

  test.each([
    ['"foo"', 'foo'],
    ['/foo', '/foo'],
    ['/^foo/', new RegExp('^foo', 'i')],
    ['/^foo/gm', new RegExp('^foo', 'gm')],
  ])('.string(%s)', (a, b) => {
    expect(casters.string(a)).toEqual(b);
  });

  test.each([
    [['"foo"'], ['foo']],
    [['/^foo/'], [new RegExp('^foo', 'i')]],
    [['/^foo/gm'], [new RegExp('^foo', 'gm')]],
  ])('.in(%s)', (a, b) => {
    expect(casters.in(a)).toEqual(b);
  });
});
