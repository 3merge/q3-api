const path = require('path');
const { findFileTraversingUpwards } = require('../..');
const stub = require('../fixtures/top/locate');

test.each([
  ['top'],
  ['top/middle'],
  ['top/middle/low'],
  ['top/middle/low/lowest'],
])('.findFileTraversingUpwards() in %s', (fixture) => {
  expect(
    findFileTraversingUpwards(
      path.join(__dirname, `../fixtures/${fixture}`),
      'locate.js',
      {},
      5,
    ),
  ).toEqual(stub);
});
