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
