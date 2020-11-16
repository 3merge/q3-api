const mongoose = require('mongoose');
const { capitalize } = require('lodash');
const { schemaComposer } = require('graphql-compose');
const m2e = require('m2e-validator');
const ValidationBuilder = require('m2e-validator/lib/middlewareBuilder');
const resolvers = require('@3merge/app-resolvers');
const {
  CREATE,
  GET,
  LIST,
  REMOVE,
  UPDATE,
  MUTATION,
  QUERY,
  CRUD_MAP,
  getOp,
  mapConstantsToQueryValue,
  makeOperationFieldNames,
} = require('./constants');
const {
  convertM2eToGraphqlSchemaTypeDef,
} = require('./helpers');

Object.entries(mongoose.models).forEach(
  ([collectionName, modelInstance]) => {
    const type = capitalize(collectionName).replace(
      /-/g,
      '',
    );

    const { schema } = new ValidationBuilder(
      m2e(modelInstance.schema).getSchemaPaths(),
    );

    const graphql = schemaComposer.createObjectTC(
      `type ${type}{
        _id: String
      }`,
    );

    const defineResolver = (acc, curr) =>
      Object.assign(acc, {
        [`${curr}${type}`]: graphql.getResolver(curr),
      });

    const makeArgumentsForSingleResource = () => ({
      id: {
        type: 'String!',
      },
    });

    const makeMutationArguments = (disableRequirements) =>
      Object.entries(schema.base).reduce(
        (acc, [field, options]) => {
          acc[field] = {
            type: convertM2eToGraphqlSchemaTypeDef(
              options,
              {
                disableRequirements,
              },
            ),
          };

          return acc;
        },
        {},
      );

    const makeResolver = (methodName) => ({
      resolve: async ({ args }) => {
        const { id, limit, page, filter = {} } = args;
        const query = Object.entries(filter).reduce(
          (acc, [field, value]) => {
            const [key, op] = getOp(field);
            acc[key] = mapConstantsToQueryValue(op, value);
            return acc;
          },
          {},
        );

        return resolvers[methodName]({
          collectionPluralName: collectionName,
          datasource: modelInstance,
          params: {
            resourceID: id,
          },
          query,
          limit,
          page,
        });
      },
    });

    const shapeComposer = () => {
      Object.entries(CRUD_MAP).forEach(([t, r]) => {
        schemaComposer[t].addFields(
          r.reduce(defineResolver, {}),
        );
      });
    };

    graphql.addFields(
      Object.entries(schema.base).reduce(
        (acc, [field, options]) => {
          acc[field] = convertM2eToGraphqlSchemaTypeDef(
            options,
          );
          return acc;
        },
        {},
      ),
    );

    schemaComposer.createInputTC({
      name: `Filter${type}Input`,
      fields: Object.entries(schema.base).reduce(
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

    graphql.addResolver({
      kind: QUERY,
      name: LIST,
      args: {
        limit: {
          type: 'Int',
          defaultValue: 20,
        },
        filter: `Filter${type}Input`,
      },
      type: schemaComposer.createObjectTC(
        `type List${type}{
          total: Float
          hasNextPage: Float
          hasPrevPage: Float
          data: [${type}]
        }`,
      ),
      ...makeResolver('List'),
    });

    graphql.addResolver({
      kind: QUERY,
      name: GET,
      type: graphql,
      args: makeArgumentsForSingleResource(),
      ...makeResolver('Get'),
    });

    graphql.addResolver({
      args: makeMutationArguments(),
      kind: MUTATION,
      name: CREATE,
      type: graphql,
      ...makeResolver('Create'),
    });

    graphql.addResolver({
      args: {
        ...makeMutationArguments(true),
        ...makeArgumentsForSingleResource(),
      },
      kind: MUTATION,
      name: UPDATE,
      type: graphql,
      ...makeResolver('Patch'),
    });

    graphql.addResolver({
      kind: MUTATION,
      name: REMOVE,
      type: graphql,
      args: makeArgumentsForSingleResource(),
      ...makeResolver('Remove'),
    });

    // done...
    shapeComposer();
  },
);

module.exports = schemaComposer.buildSchema();
