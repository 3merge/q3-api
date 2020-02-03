const { Schema } = require('mongoose');
const runner = require('../utils');
require('../url');

runner(Schema.Types.Url, [
  ['https://google.ca', true],
  ['http://google.ca', true],
  ['https://www.yahoo.com', true],
  ['yahoo.com', true],
  ['www.hooli.co.uk', true],
  ['https://googlea', false],
  ['http:/google.ca', false],
  ['htt://www.yahoo.com', false],
  ['yahoo.com2132.232489', false],
]);
