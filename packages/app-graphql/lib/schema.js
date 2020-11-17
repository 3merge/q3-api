const mongoose = require('mongoose');
const { schemaComposer } = require('graphql-compose');
const m2e = require('m2e-validator');
const ValidationBuilder = require('m2e-validator/lib/middlewareBuilder');
const { capitalize } = require('lodash');
const { CRUD_MAP } = require('./constants');
const {
  getCollectionInputName,
  getFieldDefinitions,
  getOperationDefinitions,
  getFilterInput,
  makeInput,
} = require('./helpers');
const ResolverFactory = require('./resolvers');

const getSchema = (modelInstance) =>
  new ValidationBuilder(
    m2e(modelInstance.schema).getSchemaPaths(),
  )?.schema || {};

Object.entries(mongoose.models).forEach(
  ([collectionName, modelInstance]) => {
    const s = getSchema(modelInstance)?.base;
    const type = getCollectionInputName(collectionName);
    const childSchemas =
      modelInstance?.schema?.childSchemas || [];

    if (!modelInstance?.schema?.options?.restify || !s)
      return;

    const children = childSchemas.reduce((acc, curr) => {
      const { path } = curr.model;
      const name = `${type}${path}`;

      const tc = schemaComposer.createObjectTC(
        `type ${name}{
          _id: String
        }`,
      );
      const defs = getFieldDefinitions(
        new ValidationBuilder(
          m2e(curr.schema).getSchemaPaths(),
        )?.schema?.base || {},
      );

      tc.addFields(defs);

      acc[path] = tc;

      return acc;
    }, {});

    s.discriminatorKey = s.__t;
    delete s.__t;

    const graphql = makeInput(type);

    schemaComposer.createInputTC({
      name: getFilterInput(type, s),
      fields: getOperationDefinitions(s),
    });

    graphql.addFields({
      ...getFieldDefinitions(s),
      ...children,
    });

    ResolverFactory(modelInstance)(graphql, s)
      .build()
      .forEach((res) => {
        graphql.addResolver(res);
      });

    Object.entries(CRUD_MAP).forEach(([t, r]) => {
      schemaComposer[t].addFields(
        r.reduce(
          (acc, curr) =>
            Object.assign(acc, {
              [`${curr}${type}`]: graphql.getResolver(curr),
            }),
          {},
        ),
      );
    });
  },
);

module.exports = schemaComposer.buildSchema();
