const moment = require('moment-timezone');
const {
  compact,
  isFunction,
  isObject,
  isString,
  join,
  size,
  invoke,
} = require('lodash');
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

function renderUrl(urlString = '', options) {
  const invokeFnWithCurrentContext = (obj) =>
    isObject(obj) && isFunction(obj.fn)
      ? obj.fn(this)
      : undefined;

  return new Handlebars.SafeString(
    toString(
      compact([
        !isString(urlString) || !size(urlString)
          ? invoke(global, 'getUrl', this) ||
            process.env.URL
          : urlString,
        invokeFnWithCurrentContext(options || urlString),
      ]).join('/'),
    )
      .replace(/([^:]\/)\/+/g, '$1')
      .replace(/\/+$/, ''),
  );
}

Handlebars.registerHelper('renderArray', renderArray);

Handlebars.registerHelper(
  'renderDateString',
  renderDateString,
);

Handlebars.registerHelper('renderUrl', renderUrl);

module.exports = {
  renderArray,
  renderDateString,
  renderUrl,
};
