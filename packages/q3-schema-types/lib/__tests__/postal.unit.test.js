const { Schema } = require('mongoose');
const runner = require('../utils');
require('../postal');

const M = runner(Schema.Types.Postal, [
  ['l1s9r9', true],
  ['l7r 9p0', true],
  ['90210', true],
  ['l1s99', false],
  ['19r 9p0', false],
  ['0927632', false],
]);

test('Type should normalize postal code', () => {
  const doc = new M({ test: 'L1s 7R9' });
  expect(doc.test).toMatch('L1S7R9');
});
