const moment = require('moment');
const handlebarsFunctions = require('../handlebarsFunctions');

const fn = jest.fn().mockReturnValue('test');
const context = {
  foo: 'bar',
};

beforeEach(() => {
  fn.mockClear();
});

test.each([
  [[1, 2], ' + ', '1 + 2'],
  [[1, 2], null, '1, 2'],
  ['foo', null, 'foo'],
])('.renderArray()', (a, b, expected) => {
  expect(handlebarsFunctions.renderArray(a, b)).toBe(
    expected,
  );
});

test.each([
  [
    '2021-01-01',
    undefined,
    undefined,
    'January 1, 2021 (EST)',
  ],
  [
    // assumes 12am
    '2021-01-01',
    'America/Vancouver',
    'DD MM YYYY (z)',
    '31 12 2020 (PST)',
  ],
  // testing for moment validation issues
  [new Date(), null, 'LL', moment().format('LL')],
  [
    new Date().toISOString(),
    null,
    'LL',
    moment().format('LL'),
  ],
])('.renderDateString()', (a, b, c, expected) => {
  expect(
    handlebarsFunctions.renderDateString(a, b, c).string,
  ).toBe(expected);
});

test.each([
  ['https://google.ca/app/', 'https://google.ca/app'],
  ['https://google.ca//app', 'https://google.ca/app'],
  ['www.google.ca/app/1', 'www.google.ca/app/1'],
])('.renderUrl()', (a, expected) => {
  expect(handlebarsFunctions.renderUrl(a).string).toBe(
    expected,
  );
});

test('renderUrl should call options fn', () => {
  process.env.URL = 'http://localhost:8000/';
  const { string } = handlebarsFunctions.renderUrl.call(
    context,
    { fn },
  );
  expect(fn).toHaveBeenCalledWith(context);
  expect(string).toMatch('http://localhost:8000/test');
});

test('renderUrl should call fn', () => {
  const { string } = handlebarsFunctions.renderUrl.call(
    context,
    'https://google.ca',
    { fn },
  );

  expect(fn).toHaveBeenCalledWith(context);
  expect(string).toMatch('https://google.ca/test');
});
