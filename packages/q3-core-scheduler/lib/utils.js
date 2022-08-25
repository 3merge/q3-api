const moment = require('moment');
const path = require('path');
const { get, isObject, isString } = require('lodash');
const { FAILED, STALLED } = require('./constants');

const add = (...params) => moment().add(...params);

const composeAsync =
  (...fns) =>
  (initialValues) =>
    fns.reduceRight(
      (sum, fn) => Promise.resolve(sum).then(fn),
      initialValues,
    );

const getNextDate = (value) => {
  switch (value) {
    case 'annually':
      return add(1, 'years');
    case 'biannually':
      return add(2, 'quarters');
    case 'quarterly':
      return add(1, 'quarters');
    case 'monthly':
      return add(1, 'months');
    case 'weekly':
      return add(1, 'weeks');
    case 'daily':
      return add(1, 'days');
    case 'bihourly':
      return add(2, 'hours');
    case 'hourly':
      return add(1, 'hours');
    case 'semihourly':
      return add(30, 'minutes');
    case 'biminutely':
      return add(2, 'minutes');
    case 'minutely':
      return add(1, 'minutes');
    default:
      return null;
  }
};

const getInterval = (v) =>
  isString(v) ? v.split('@')[1] : undefined;

const isJob = (v) => isString(v) && v.startsWith('on');

const getFileName = (name) =>
  path.basename(name, path.extname(name));

const isRecurringJob = (name) =>
  Boolean(getInterval(name) && isJob(name));

const getStatus = (v = 0) => (v > 3 ? FAILED : STALLED);
const getMessage = (e) =>
  typeof e === 'object' && e !== null
    ? e.message
    : undefined;

const stringify = (data) =>
  isObject(data) ? JSON.stringify(data) : '';

const parse = (v) => {
  try {
    if (isString(v)) return JSON.parse(v);
    if (isObject(v)) return v;
    throw new Error(`Cannot parse ${typeof v}`);
  } catch (e) {
    return {};
  }
};

const toJson = (data) =>
  data && 'toJSON' in data ? data.toJSON() : data;

const makePayload = (data) => {
  const formatted = toJson(data);
  const checkBlacklist = (obj) => {
    [
      '__v',
      'apiKeys',
      'changelog',
      'enableServerToServer',
      'loginAttempts',
      'secretIssuedOn',
      'tours',
      'uploads',
      'password',
      'lastLoggedIn',
    ].forEach((key) => {
      if (obj[key]) {
        // eslint-disable-next-line
        delete obj[key];
      }
    });
  };

  if (isObject(formatted)) {
    checkBlacklist(formatted);

    if (isObject(formatted.session)) {
      checkBlacklist(formatted.session);

      if (isObject(formatted.session.USER))
        checkBlacklist(formatted.session.USER);
    }
  }

  return stringify(formatted);
};

const forwardPayload = (fn) => (choreData) =>
  fn({
    ...toJson(choreData),
    data: parse(get(choreData, 'payload')),
  });

module.exports = {
  composeAsync,
  isJob,
  isRecurringJob,
  forwardPayload,
  getStatus,
  getInterval,
  getMessage,
  getNextDate,
  getFileName,
  makePayload,
  stringify,
  parse,
};
