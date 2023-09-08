const getMaxFileSize = require('../getMaxFileSize');

test.each([
  ['', 52428800],
  [null, 52428800],
  [undefined, 52428800],
  [true, 52428800],
  [false, 52428800],
  ['1', 1],
  [0, 0],
])('getMaxFileSize', (a, expected) => {
  process.env.Q3_MAX_FILE_SIZE = a;
  expect(getMaxFileSize()).toBe(expected);
});
