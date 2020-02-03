const { Schema } = require('mongoose');
const runner = require('../utils');
require('../email');

const M = runner(Schema.Types.Email, [
  ['mibberson@3merge.ca', true],
  ['m.ibberson@3merge.ca', true],
  ['mibberson+alias@3merge.ca.uk', true],
  ['mibberson', false],
  ['mibberson__@gmail', false],
  ['mibberson.com', false],
]);

test('Type should normalize email', () => {
  const doc = new M({ test: 'MIBBERSON@3merge.ca' });
  expect(doc.test).toMatch('mibberson@3merge.ca');
});
