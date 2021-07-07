const mongoose = require('mongoose');
const casters = require('../casters');

const id = mongoose.Types.ObjectId();

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
    // matches on null and undefined
    expect(casters.has('false')).toBeNull();
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
    [id.toString(), id],
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
