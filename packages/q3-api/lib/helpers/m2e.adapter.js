const { get, merge, pick } = require('lodash');

const filterFalsy = (value) => value.filter(Boolean);

const minMax = ({ minLength, maxLength, min, max }) => ({
  options: {
    min: min || minLength,
    max: max || maxLength,
  },
});

const setDynamicErrorMsg = (term) => (
  value,
  { req: { t } },
) =>
  t(`validations:${term}`, {
    value,
  });

class ValidationSchemaMapper {
  constructor(opts = {}, strict) {
    this.options = opts;
    this.strictMode = strict;

    /**
     * @NOTE
     * All supported conversions below.
     * We can expand later.
     */
    this.$ref = {
      string: {
        ...this.required,
        ...this.enum,
        trim: true,
        isString: true,
      },
      email: {
        ...this.required,
        isEmail: true,
        normalizeEmail: true,
        trim: true,
      },
      phone: {
        ...this.required,
        isMobilePhone: true,
      },
      url: {
        ...this.required,
        isURL: true,
        trim: true,
      },
      number: {
        ...this.required,
        toFloat: true,
      },
      array: {
        ...this.required,
        custom: {
          options: Array.isArray,
        },
        customSanitizer: {
          options: filterFalsy,
        },
      },
      date: {
        ...this.required,
        isISO8601: true,
      },
      boolean: {
        ...this.required,
        isBoolean: true,
      },
    };
  }

  fromTo(s = '') {
    /**
     * @NOTE
     * Looks rather messy.
     * Essentially, look for loose reference to internal map.
     * On match, assign it's properties along with an error message.
     */
    const {
      options: { systemOnly },
      $ref,
    } = this;
    return !systemOnly
      ? Object.entries($ref).reduce(
          (a, [k, v]) =>
            k.includes(s.toLowerCase())
              ? Object.assign(v, {
                  errorMessage: setDynamicErrorMsg(k),
                })
              : a,
          {},
        )
      : {};
  }

  get enum() {
    const {
      options: { enum: acceptable },
    } = this;
    return Array.isArray(acceptable) && acceptable.length
      ? {
          isIn: {
            options: [acceptable],
            errorMessage: setDynamicErrorMsg('enum', {
              acceptable: acceptable.join(', '),
            }),
          },
        }
      : {};
  }

  get length() {
    const { options } = this;
    return {
      isLength: minMax(options).options,
    };
  }

  get range() {
    const { options } = this;
    return {
      isNumeric: minMax(options),
    };
  }

  get required() {
    /**
     * @NOTE
     * Strict mode enforeces required props.
     * Otherwise, it just won't allow nullable values.
     */
    const {
      options: { required },
      strictMode,
    } = this;

    if (required && !strictMode)
      return {
        optional: {
          nullable: true,
          falsy: true,
        },
      };

    if (required)
      return {
        isEmpty: {
          negated: true,
          checkFalsy: true,
          errorMessage: setDynamicErrorMsg('required'),
        },
      };

    return {
      optional: {
        options: {
          checkFalsy: true,
        },
      },
    };
  }
}

const interpretSchemaOptions = (
  s,
  enforceRequiredPaths = true,
) => {
  const recursivelyReduceSchema = (
    schema,
    mergeWith,
    next,
  ) =>
    Object.entries(schema.discriminators).reduce(
      (acc, [key, value]) => merge(acc, next(value, key)),
      mergeWith,
    );

  const iterateSchemaPaths = (
    schema = {},
    field = 'base',
  ) => {
    const output = {};

    schema.eachPath((pathname, t) => {
      const {
        constructor: { name },
        options,
      } = t;

      if (
        (name !== 'SingleNestedPath' &&
          name !== 'DocumentArray' &&
          name !== 'DocumentArrayPath' &&
          pathname !== '_id' &&
          pathname !== 'active' &&
          pathname !== 'createdBy' &&
          pathname !== '__v') ||
        options.includeInRest
      )
        merge(output, {
          [field]: {
            [pathname]: new ValidationSchemaMapper(
              pick(options, [
                'required',
                'systemOnly',
                'unique',
                'minLength',
                'maxLength',
                'min',
                'max',
                'enum',
              ]),
              enforceRequiredPaths,
            ).fromTo(
              get(
                options,
                'validate.message',
                options.type.name || name,
              ),
            ),
          },
        });
    });

    return schema.discriminators
      ? recursivelyReduceSchema(
          schema,
          output,
          iterateSchemaPaths,
        )
      : output;
  };

  const iterateChildSchemaPaths = (schema = {}, field) => {
    const output = {};

    schema.childSchemas.reduce(
      (acc, i) =>
        merge(acc, {
          [i.model.path]: iterateSchemaPaths(
            i.schema,
            field,
          ),
        }),
      output,
    );

    return schema.discriminators
      ? recursivelyReduceSchema(
          schema,
          output,
          iterateChildSchemaPaths,
        )
      : output;
  };

  return {
    paths: iterateSchemaPaths(s),
    subpaths: iterateChildSchemaPaths(s),
  };
};

interpretSchemaOptions.ValidationSchemaMapper = ValidationSchemaMapper;
module.exports = interpretSchemaOptions;
