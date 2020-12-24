const { clean } = require('../../lib/helpers');

describe('clean', () => {
  it('should trim all items in the array', () => {
    expect(clean(' ~This. is a test! ')).toEqual(
      'thisisatest',
    );
  });
});
