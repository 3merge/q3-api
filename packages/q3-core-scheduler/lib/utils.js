const moment = require('moment');
const path = require('path');
const { FAILED, STALLED } = require('./constants');

const add = (...params) => moment().add(...params);

const isString = (v) => typeof v === 'string';

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

const isRecurringJob = (name) => {
  const f = path.basename(name, path.extname(name));
  return Boolean(getInterval(f) && isJob(f));
};

const getStatus = (v = 0) => (v > 3 ? FAILED : STALLED);

const json = (method) => (v) => {
  try {
    return JSON[method](v);
  } catch (e) {
    return undefined;
  }
};

const stringify = json('stringify');
const parse = json('parse');

const makePayload = (data) =>
  stringify(
    data && 'toJSON' in data ? data.toJSON() : data,
  );

module.exports = {
  isJob,
  isRecurringJob,
  getStatus,
  getInterval,
  getNextDate,
  makePayload,
  stringify,
  parse,
};
