/* eslint-disable no-param-reassign */
const moment = require('moment');
const micromatch = require('micromatch');
const { compact } = require('lodash');

/**
 * Useful for post-middleware as the first parameters varies depending on op.
 */
exports.executeOnAsync = async (target, next) =>
  Array.isArray(target)
    ? Promise.all(target.map(next))
    : next(target);

exports.executeOn = (target, next) =>
  Array.isArray(target) ? target.map(next) : next(target);

/**
 * Drop-in mongoose schemas.
 */
exports.withDateRange = (schema) => {
  schema.add({
    effectiveFrom: Date,
    expiresOn: Date,
  });

  schema.methods.hasNotYetBegun = function isAfter() {
    const { effectiveFrom } = this;

    return (
      effectiveFrom &&
      moment(effectiveFrom).isAfter(new Date())
    );
  };

  schema.methods.hasExpired = function isBefore() {
    const { expiresOn } = this;

    return (
      expiresOn && moment(expiresOn).isBefore(new Date())
    );
  };

  schema.statics.getDateQuery = function query() {
    const today = new Date();
    return {
      $and: [
        {
          $or: [
            { effectiveFrom: { $lte: today } },
            { effectiveFrom: { $exists: false } },
            { effectiveFrom: '' },
          ],
        },
        {
          $or: [
            { expiresOn: { $gte: today } },
            { expiresOn: { $exists: false } },
            { expiresOn: '' },
          ],
        },
      ],
    };
  };

  return schema;
};

exports.withNorthAmericanCurrency = (schema) => {
  schema.add({
    currency: {
      type: String,
      default: 'CAD',
      enum: ['CAD', 'USD'],
      required: true,
    },
  });

  schema.methods.convert = (
    num,
    inboundCurrency,
    outboundCurrency,
    rate,
  ) => {
    let sum = num;
    const equals = inboundCurrency === outboundCurrency;

    if (!equals && inboundCurrency === 'USD')
      sum = num * rate;
    if (!equals && inboundCurrency === 'CAD')
      sum = num / rate;
    return sum;
  };

  return schema;
};

/**
 * Random helper functions
 */
const toFixed = (num, fb = 0) =>
  Math.floor(Number.isNaN(num) ? fb : num * 100) / 100;

const compareObjectIds = (a, b) =>
  typeof a === 'object' && 'equals' in a
    ? a.equals(b)
    : a === b;

const isMatch = (name, resource = '*') => {
  let pattern = compact(resource);
  if (!pattern) pattern = ['!*'];
  if (!name) return false;

  return micromatch.isMatch(name, pattern, {
    nocase: true,
  });
};

exports.round = toFixed;
exports.equals = compareObjectIds;
exports.isMatch = isMatch;

exports.multiply = (a, b) => toFixed(a * b);

exports.increment = (factor, base, comparative) => {
  if (factor > 1.5)
    throw new Error('Factor should be less than 1.5');

  const perc = 1 - factor;
  const deduction = perc * base;
  return toFixed(comparative - deduction);
};

exports.asNum = (num) =>
  Number.isNaN(num) || num === null || undefined === num
    ? 0
    : num;

/**
 * De-duplicated from discounts, orders and rebates.
 * Otherwise, likely useless.
 */
exports.filters = {
  byObjectId(id, key) {
    return (v) => {
      try {
        return v[key].equals(id);
      } catch (err) {
        try {
          return v[key].id.equals(id);
        } catch (e) {
          return false;
        }
      }
    };
  },

  filterByName(name, key = 'resource') {
    return (v) => {
      if (!name || typeof v !== 'object') return false;
      const pattern = Array.isArray(v[key])
        ? v[key]
        : [v[key] || '!*'];

      return isMatch(name, pattern);
    };
  },
};
