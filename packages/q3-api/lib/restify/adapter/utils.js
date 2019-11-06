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

const decypherMessage = (v) => {
  let validator;

  const containsWord = (n) =>
    String(v === 'object' ? v.message : '')
      .toLowerCase()
      .includes(n);

  if (containsWord('email')) validator = 'isEmail';
  if (containsWord('phone')) validator = 'isMobilePhone';
  if (containsWord('url')) validator = 'isURL';

  return {
    isLength: { options: { min: 1 } },
    errorMessage: setDynamicErrorMsg(
      validator || 'isString',
    ),
    ...(validator && { [validator]: true }),
  };
};

const mapToValue = (o = {}, fn) =>
  Object.entries(o).reduce((a, [name, props]) => {
    const copy = { ...a };
    const v = fn(props);
    if (v) copy[name] = v;
    return copy;
  }, {});

const getValidationType = (v = '', opts = {}) => {
  const str = v.toLowerCase();
  const out = {
    in: ['body', 'query'],
  };

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

  if (str.includes('string'))
    return {
      ...out,
      isLength: { options: { min: 1 } },
      errorMessage: setDynamicErrorMsg('isString'),
    };

  if (str.includes('email'))
    return {
      ...out,
      isEmail: true,
      errorMessage: setDynamicErrorMsg('isEmail'),
    };

  if (str.includes('phone'))
    return {
      ...out,
      isMobilePhone: true,
      errorMessage: setDynamicErrorMsg('isPhone'),
    };

  if (str.includes('url'))
    return {
      ...out,
      isURL: true,
      errorMessage: setDynamicErrorMsg('isUrl'),
    };

  if (str.includes('number'))
    return {
      ...out,
      isFloat: true,
      errorMessage: setDynamicErrorMsg('isNumber'),
    };

  if (str.includes('array'))
    return {
      ...out,
      errorMessage: setDynamicErrorMsg('isArray'),
      custom: {
        options: Array.isArray,
      },
      customSanitizer: {
        options: (value) => {
          return value.filter(Boolean);
        },
      },
    };

  if (str.includes('date'))
    return {
      ...out,
      isISO8601: true,
      errorMessage: setDynamicErrorMsg('isDate'),
    };

  if (str.includes('bool'))
    return {
      ...out,
      isBoolean: true,
      errorMessage: setDynamicErrorMsg('isBoolean'),
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
