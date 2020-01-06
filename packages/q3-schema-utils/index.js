/* eslint-disable no-param-reassign */
const moment = require('moment');
const micromatch = require('micromatch');

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
      !effectiveFrom ||
      moment(effectiveFrom).isAfter(new Date())
    );
  };

  schema.methods.hasExpired = function isBefore() {
    const { expiresOn } = this;
    return (
      !expiresOn || moment(expiresOn).isBefore(new Date())
    );
  };

  schema.statics.getDateQuery = function query() {
    const today = new Date();
    return {
      $or: [
        { active: true },
        { active: { $exists: false } },
      ],
      $and: [
        {
          $or: [
            { effectiveFrom: { $lte: today } },
            { effectiveFrom: { $exists: false } },
          ],
        },
        {
          $or: [
            { expiresOn: { $gte: today } },
            { expiresOn: { $exists: false } },
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

const isMatch = (name, pattern = '*') =>
  micromatch.isMatch(String(name).toLowerCase(), pattern, {
    nocase: true,
  });

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
      return isMatch(name, v[key] || ['!*']);
    };
  },
};
