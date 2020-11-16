const { capitalize } = require('lodash');
const { schemaComposer } = require('graphql-compose');
const { makeOperationFieldNames } = require('./constants');

const convertM2eToGraphqlSchemaTypeDef = (
  attributes = {},
  options = {},
) => {
  let v = 'String';

  if (attributes.toFloat) v = 'Float';
  if (attributes.toDate) v = 'Date';
  if (
    attributes?.isEmpty?.checkFalsy &&
    !options?.disableRequirements
  )
    v += '!';

  return v;
};

exports.makeInput = (type) =>
  schemaComposer.createObjectTC(
    `type ${type}{
        _id: String
      }`,
  );

exports.getCollectionInputName = (collectionName) =>
  capitalize(collectionName)
    .split('-')
    .map(capitalize)
    .join('');

exports.getFieldDefinitions = (schema) =>
  Object.entries(schema).reduce((acc, [field, options]) => {
    acc[field] = convertM2eToGraphqlSchemaTypeDef(options);
    return acc;
  }, {});

exports.getOperationDefinitions = (schema) =>
  Object.entries(schema).reduce((acc, [field, options]) => {
    makeOperationFieldNames(field).forEach((op) => {
      acc[op] = convertM2eToGraphqlSchemaTypeDef(options, {
        disableRequirements: true,
      });
    });

    return acc;
  }, {});

exports.getFilterInput = (collectionName, schema = {}) => {
  const name = `Filter${collectionName}Input`;
  schemaComposer.createInputTC({
    name,
    fields: Object.entries(schema).reduce(
      (acc, [field, options]) => {
        makeOperationFieldNames(field).forEach((op) => {
          acc[op] = convertM2eToGraphqlSchemaTypeDef(
            options,
            {
              disableRequirements: true,
            },
          );
        });

        return acc;
      },
      {},
    ),
  });

  return name;
};

exports.getUpdateArguments = (schema, schemaOptions) =>
  Object.entries(schema).reduce(
    (acc, [field, fieldOptions]) => {
      acc[field] = {
        type: convertM2eToGraphqlSchemaTypeDef(
          fieldOptions,
          schemaOptions,
        ),
      };

      return acc;
    },
    {},
  );
