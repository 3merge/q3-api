const mongoose = require('mongoose');
const checkTypes = require('./types');

/*

const isNotID = (id) =>
  id
    ? {
        _id: { $ne: id },
      }
    : {};

     const checkIfExists = async (
      value,
      { req: { params, t }, path },
    ) => {
      const exists = await this.countDocuments({
        ...isNotID(params.resourceID),
        [path]: value,
      });

      if (!exists) return true;
      throw t('validations:unique', { value });
    }; */

const getSchemaParts = (m) => {
  const { collectionName } = m.collection;
  const { schema } = mongoose.model(collectionName);
  const { paths = {}, discriminators = {} } = schema;
  return { paths, discriminators, schema };
};

const readSchemaPaths = (o = {}) =>
  Object.entries(o).reduce((acc, [key, v]) => {
    const def = checkTypes(v);
    if (
      def &&
      !key.includes('_') &&
      ![
        'active',
        'createdBy',
        'password',
        'updatedAt',
        'createdAt',
        'undefined',
      ].includes(key) &&
      !v.options.private
    )
      acc[key] = def;

    return acc;
  }, {});

const setDynamicErrorMsg = (term, vars = {}) => (
  value,
  { req: { t } },
) =>
  t(`validations:${term}`, {
    ...vars,
    value,
  });

const mapToValue = (o = {}, fn) =>
  Object.entries(o).reduce((a, [name, props]) => {
    const copy = { ...a };
    const v = fn(props);
    if (v) copy[name] = v;
    return copy;
  }, {});

const getValidationType = (v = '', opts = {}) => {
  const out = {};
  const str = v.toLowerCase();

  if (opts.systemOnly) return out;

  if (opts.enum)
    out.isIn = {
      options: [opts.enum],
      errorMessage: setDynamicErrorMsg('enum', {
        acceptable: opts.enum.join(', '),
      }),
    };

  if (!opts.required)
    out.optional = {
      options: {
        nullable: false,
        falsy: true,
      },
    };

  if (str.includes('email'))
    return {
      ...out,
      isEmail: true,
      errorMessage: setDynamicErrorMsg('isEmail'),
    };

  if (str.includes('string'))
    return {
      ...out,
      isString: true,
      errorMessage: setDynamicErrorMsg('isString'),
    };

  if (str.includes('number'))
    return {
      ...out,
      isInt: true,
      errorMessage: setDynamicErrorMsg('isNumber'),
    };

  return out;
};

module.exports = {
  getSchemaParts,
  readSchemaPaths,
  setDynamicErrorMsg,
  mapToValue,
  getValidationType,
};
