const mongoose = require('mongoose');
const { get, merge, pick } = require('lodash');
const { getValidationType } = require('./utils');

mongoose.plugin((s) => {
  // eslint-disable-next-line
  s.statics.getValidation = function interpretSchemaOptions() {
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
          name !== 'SingleNestedPath' &&
          name !== 'DocumentArray' &&
          pathname !== '_id' &&
          pathname !== '__v'
        )
          merge(output, {
            [field]: {
              [pathname]: getValidationType(
                get(
                  options,
                  'validate.message',
                  options.type.name,
                ),
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

    const iterateChildSchemaPaths = (
      schema = {},
      field,
    ) => {
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
});
