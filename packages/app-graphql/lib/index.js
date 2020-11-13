require('../../../demo/models');
const { ApolloServer } = require('apollo-server-express');
const mongoose = require('mongoose');
const { capitalize } = require('lodash');
const { schemaComposer } = require('graphql-compose');
const m2e = require('m2e-validator');
const ValidationBuilder = require('m2e-validator/lib/middlewareBuilder');
const { Redact } = require('q3-core-access');

const GREATER_THAN = 'gt';
const LESS_THAN = 'lt';
const GREATER_THAN_EQUALS = 'gte';
const LESS_THAN_EQUALS = 'gte';
const LIKE = 'like';
const EQUALS = 'eq';
const NOT_EQUALS = 'ne';

schemaComposer.createInputTC({
  name: 'FilterOperatorsInput',
  fields: {
    op: 'String!',
    value: 'String!',
  },
});

Object.entries(mongoose.models).forEach(
  ([collectionName, modelInstance]) => {
    const type = capitalize(collectionName);

    const { schema } = new ValidationBuilder(
      m2e(modelInstance.schema).getSchemaPaths(),
    );

    const graphql = schemaComposer.createObjectTC(
      `type ${type}{
        _id: String
      }`,
    );

    graphql.addFields(
      Object.entries(schema.base).reduce(
        (acc, [field, options]) => {
          const getType = () => {
            let v = 'String';
            if (options.toFloat) v = 'Float';
            if (options.toDate) v = 'Date';
            if (options?.isEmpty?.checkFalsy) v += '!';
            return v;
          };

          acc[field] = getType();
          return acc;
        },
        {},
      ),
    );

    schemaComposer.createInputTC({
      name: `Filter${type}Input`,
      fields: Object.entries(schema.base).reduce(
        (acc, [field, options]) => {
          const getType = () => {
            let v = 'String';
            if (options.toFloat) v = 'Float';
            if (options.toDate) v = 'Date';
            return v;
          };

          [
            GREATER_THAN,
            LESS_THAN,
            GREATER_THAN_EQUALS,
            LESS_THAN_EQUALS,
            LIKE,
            EQUALS,
            NOT_EQUALS,
          ].forEach((op) => {
            acc[`${field}__${op}`] = getType();
          });

          return acc;
        },
        {},
      ),
    });

    graphql.addResolver({
      kind: 'query',
      name: 'list',
      args: {
        limit: {
          type: 'Int',
          defaultValue: 20,
        },
        filter: `Filter${type}Input`,
      },
      type: [graphql],
      resolve: async ({
        args: { limit, filter = {} },
        context,
      }) => {
        const query = Object.entries(filter).reduce(
          (acc, [field, value]) => {
            const [key, op] = field.split('__');

            const getValue = () => {
              switch (op) {
                case 'like':
                  return new RegExp(value, 'gi');
                case 'lte':
                  return { $lte: value };
                case 'gte':
                  return { $gte: value };
                case 'ne':
                  return { $ne: value };
                case 'eq':
                default:
                  return value;
              }
            };

            acc[key] = getValue();
            return acc;
          },
          {},
        );

        const q = await modelInstance
          .find(query)
          .limit(limit)
          .lean()
          .exec();

        return Promise.all(
          q.map((item) =>
            Redact(item, context.user, collectionName),
          ),
        );
      },
    });

    graphql.addResolver({
      kind: 'mutation',
      name: 'create',
      args: Object.entries(schema.base).reduce(
        (acc, [field, options]) => {
          const getType = () => {
            let v = 'String';
            if (options.toFloat) v = 'Float';
            if (options.toDate) v = 'Date';
            if (options?.isEmpty?.checkFalsy) v += '!';
            return v;
          };

          acc[field] = { type: getType() };
          return acc;
        },
        {},
      ),
      type: graphql,
      resolve: async ({ args }) => {
        return modelInstance.create(args);
      },
    });

    schemaComposer.Mutation.addFields({
      [`create${type}`]: graphql.getResolver('create'),
    });

    schemaComposer.Query.addFields({
      [`list${type}`]: graphql.getResolver('list'),
    });
  },
);

module.exports = new ApolloServer({
  schema: schemaComposer.buildSchema(),
});
