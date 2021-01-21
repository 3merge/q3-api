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
  ['982271234325', true],
  ['8001234321', true],
  ['8001234321x1234', true],
  ['8001234321poste121', true],
  ['41599986756 PO 123433', true],
  ['a8415699986756 PO 123433', false],
  ['905a4561234x987', false],
]);

test('Type should normalize tel', () => {
  const doc = new M({ test: '9053331234' });
  expect(doc.test).toMatch('(905) 333-1234');
});

test('Type should normalize extensions', () => {
  const doc = new M({ test: '9053331234ext123' });
  expect(doc.test).toMatch('(905) 333-1234 x123');
});

test('Type should normalize french extensions', () => {
  const doc = new M({ test: '905-333-1234 poste 123' });
  expect(doc.test).toMatch('(905) 333-1234 x123');
});

test('Type should normalize country codes', () => {
  const doc = new M({ test: '19053331234' });
  expect(doc.test).toMatch('+1 (905) 333-1234');
});

test('Type combine all conditions', () => {
  const doc = new M({ test: '449053331234 x12' });
  expect(doc.test).toMatch('+44 (905) 333-1234 x12');
});
