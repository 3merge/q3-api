const {
  isObject,
  first,
  uniq,
  compact,
  join,
  omitBy,
  isNull,
} = require('lodash');
const flat = require('flat');

const toPlainObject = (xs) =>
  isObject(xs) ? JSON.parse(JSON.stringify(xs)) : {};

const omitByKeyName =
  (keylist = []) =>
  (xs) =>
    omitBy(
      flat(xs),
      (value, key) =>
        keylist.some((phrase) => key.includes(phrase)) ||
        isNull(value),
    );

function explode(obj) {
  const acc = [];
  const exec = (v, path = '') => {
    const out = {};

    if (isObject(v))
      Object.entries(v).forEach(([key, entry]) => {
        const keyPath = join(compact([path, key]), '.');
        if (Array.isArray(entry)) {
          if (isObject(first(entry)))
            entry
              .map((item) => exec(item, keyPath))
              .flat()
              .forEach((item) => acc.push(item));
        } else
          Object.assign(out, {
            [keyPath]: entry,
          });
      });

    acc.push(out);
    return out;
  };

  exec(toPlainObject(obj));

  return uniq(acc).map(
    omitByKeyName([
      '__v',
      'ngrams',
      'createdAt',
      'createdBy',
      'changelog',
      'lastModifiedBy',
      'updatedAt',
    ]),
  );
}

module.exports = explode;

explode.omitByKeyName = omitByKeyName;
