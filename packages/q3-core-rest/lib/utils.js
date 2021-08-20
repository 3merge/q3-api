const mongoose = require('mongoose');
const { isObject } = require('lodash');
const flatten = require('flat');

exports.getColumnsHeadersFromPayload = (o) =>
  o.reduce((a, c) => {
    const keys = Object.keys(flatten(c));
    return keys.length > a.length ? keys : a;
  }, []);

exports.populateEmptyObjectKeys = (o, keys) =>
  o.map((p) => {
    const flat = flatten(p);
    keys.forEach((key) => {
      if (!flat[key]) flat[key] = '';
    });

    return flat;
  });

exports.transformArraysInDotNotation = (arr, next) =>
  arr.map((r) =>
    Object.entries(r).reduce(
      (a, c) =>
        Object.assign(a, {
          [next(c[0].replace(/(\.\d+\.)/, '.$.'))]: c[1],
        }),
      {},
    ),
  );

exports.pick = (obj, keys) =>
  keys.reduce(
    (acc, next) =>
      Object.assign(acc, {
        [next]: obj[next],
      }),
    {},
  );

exports.isSimpleSubDocument = (parent, fieldName) => {
  if (typeof parent.schema.path !== 'function')
    return false;
  const meta = parent.schema.path(fieldName);
  return (
    meta && meta.constructor.name === 'SingleNestedPath'
  );
};

exports.castObjectIds = (v) =>
  Object.entries(v).reduce((acc, [key, val]) => {
    if (val && /ObjectId/.test(val)) {
      acc[key] = mongoose.Types.ObjectId(
        val.replace(new RegExp(/^ObjectId\(|\)/, 'gi'), ''),
      );
    } else {
      acc[key] = val;
    }

    return acc;
  }, {});

exports.toJSON = (xs) => {
  try {
    if (!isObject(xs)) throw new Error('Not an object');
    return JSON.parse(JSON.stringify(xs));
  } catch (e) {
    return {};
  }
};

exports.assignIdsOnSubDocuments = (xs = {}) => {
  try {
    const recurse = (data) => {
      if (isObject(data)) {
        if (data.id && !data._id) {
          // eslint-disable-next-line
          data._id = data.id;
        }

        Object.entries(data).forEach(([, value]) => {
          if (Array.isArray(value)) {
            value.map(recurse);
          } else if (isObject(value)) {
            recurse(value);
          }
        });
      }
    };

    recurse(xs);
  } catch (e) {
    // noop
  }

  return xs;
};
