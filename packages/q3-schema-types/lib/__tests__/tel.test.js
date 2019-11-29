const { Schema } = require('mongoose');
const runner = require('../utils');
require('../tel');

const M = runner(Schema.Types.Tel, [
  ['123-903-1234', true],
  ['(416)888-3241', true],
  ['111.999.7183', true],
  ['9871234325', true],
  ['123-903-123', false],
  ['+1 905 3211', false],
  ['(416)     888-3241', true],
  ['111.999..7183', true],
  ['982271234325', false],
  ['8001234321', true],
]);

test('Type should normalize tel', () => {
  const doc = new M({ test: '9053331234' });
  expect(doc.test).toMatch('(905) 333-1234');
});
