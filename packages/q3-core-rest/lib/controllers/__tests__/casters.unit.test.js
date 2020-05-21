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
});
