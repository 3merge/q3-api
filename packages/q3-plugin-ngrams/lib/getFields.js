const { get } = require('lodash');
const { filterByLength } = require('./helpers');

module.exports = (s) => {
  const fields = [];

  const recursivelyFindGrams = (schema, prevpath = '') =>
    schema.eachPath((path, obj) => {
      const parts = [prevpath, path];
      const join = filterByLength(parts).join('.');

      if (get(obj, 'options.gram', false))
        fields.push(join);

      if (obj.schema)
        recursivelyFindGrams(obj.schema, join);
    });

  recursivelyFindGrams(s);

  if (s.discriminators)
    Object.values(s.discriminators).forEach((v) =>
      recursivelyFindGrams(v),
    );

  return fields;
};
