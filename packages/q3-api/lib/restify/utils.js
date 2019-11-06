const {
  checkSchema,
  validateIf,
} = require('q3-core-composer');

const isDiscriminated = (schema) =>
  schema.discriminators &&
  Object.keys(schema.discriminators).length;

const discernIfValidationSchemaIsDiscriminated = (
  schema,
  discriminatorKey,
) => {
  const hasMultiple = Object.keys(schema).length > 1;
  if (hasMultiple || (!hasMultiple && !schema.base)) {
    return [validateIf(discriminatorKey, schema)];
  }

  return [checkSchema(schema.base)];
};

module.exports = {
  isDiscriminated,
  discernIfValidationSchemaIsDiscriminated,
};
