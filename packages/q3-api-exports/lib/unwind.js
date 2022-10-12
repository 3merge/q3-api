const {
  isObject,
  first,
  isEqual,
  compact,
  join,
  pick,
  size,
} = require('lodash');

const sizeOf = (xs) => size(Object.keys(xs));

module.exports = function unravel(obj, keys = []) {
  const acc = [];
  const combine = {};

  const addTo = (item) => {
    const picked = size(keys) ? pick(item, keys) : item;
    const incomingSize = sizeOf(picked);
    if (!incomingSize) return;

    if (
      !acc.find((b, i) => {
        const target = {
          ...picked,
          ...b,
        };

        const matched = isEqual(
          {
            ...b,
            ...picked,
          },
          target,
        );

        if (matched) acc[i] = target;
        return matched;
      })
    )
      acc.push(picked);
  };

  const exec = (v, path = '') => {
    // shallow arrays and dates should print out directly
    // just like primitive values
    if (
      !isObject(v) ||
      Array.isArray(v) ||
      v instanceof Date
    )
      return Object.assign(combine, {
        [path]: v,
      });

    Object.entries(v)
      // ensure all arrays are at the bottom of the object
      // otherwise the combine object isn't fully populated
      .sort((a, b) => {
        if (Array.isArray(b[1])) {
          if (isObject(first(b[1]))) return -1;
          return 1;
        }

        if (isObject(b[1])) {
          return 0;
        }

        return 1;
      })
      .forEach(([key, entry]) => {
        const keyPath = join(compact([path, key]), '.');

        if (Array.isArray(entry) && isObject(first(entry)))
          entry.forEach((sub) => {
            exec(sub, keyPath);

            // cleanup to prevent data leaks in nested arrays
            Object.keys(combine).forEach((k) => {
              if (new RegExp(`${keyPath}\\.`, 'gm').test(k))
                delete combine[k];
            });
          });
        else
          addTo({
            ...exec(entry, keyPath),
          });
      });

    return combine;
  };

  exec(obj);
  return acc;
};
