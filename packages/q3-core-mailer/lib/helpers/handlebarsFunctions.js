// eslint-disable-next-line
const moment = require('moment-timezone');
const { isString, join } = require('lodash');
const Handlebars = require('handlebars');

const isDate = (str) => str instanceof Date;

// test with date objects
const toString = (str, defaultValue = undefined) => {
  if (isString(str) || isDate(str))
    return Handlebars.escapeExpression(str);
  return defaultValue;
};

const renderArray = (array, char) =>
  Array.isArray(array)
    ? join(array, toString(char, ', '))
    : toString(array);

const renderDateString = (dateString, tz, format) =>
  new Handlebars.SafeString(
    moment(
      isDate(dateString)
        ? dateString.toISOString()
        : toString(dateString),
    )
      .tz(toString(tz, 'America/Toronto'))
      .format(toString(format, 'LL (z)')),
  );

Handlebars.registerHelper('renderArray', renderArray);

Handlebars.registerHelper(
  'renderDateString',
  renderDateString,
);

module.exports = {
  renderArray,
  renderDateString,
};
