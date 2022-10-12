const moment = require('moment');
const formatter = require('../../lib/formatter');

beforeEach(() => {
  process.env.TZ_DEFAULT = 'America/Toronto';
});

const d = moment();

test.each([
  [1, 'number', 1],
  [1.11, 'number', 1.11],
  ['one', 'number', 0],
  [1, 'price', '$1.00'],
  [1.9876, 'price', '$1.99'],
  [false, 'string', ''],
  [null, 'string', ''],
  [undefined, 'string', ''],
  ['null', 'string', ''],
  ['undefined', 'string', ''],
  ['false', 'string', ''],
  [true, 'boolean', true],
  ['true', 'boolean', true],
  [false, 'boolean', false],
  ['false', 'boolean', false],
  [
    d.utc(),
    'date',
    d.tz('America/Toronto').format('YYYY-MM-DD'),
  ],
  ['123-0912380123', 'date', ''],
  [['FOO', 'BAR'], 'string', 'FOO, BAR'],
])('.formatter(%s, %s)', (a, b, expected) =>
  expect(formatter(a, b)).toEqual(expected),
);
