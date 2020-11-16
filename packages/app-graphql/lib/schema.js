const mongoose = require('mongoose');
const { schemaComposer } = require('graphql-compose');
const m2e = require('m2e-validator');
const ValidationBuilder = require('m2e-validator/lib/middlewareBuilder');
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
    if (!modelInstance?.schema?.options?.restify) return;

    const schema = getSchema(modelInstance);
    const type = getCollectionInputName(collectionName);
    const graphql = makeInput(type);

    schemaComposer.createInputTC({
      name: getFilterInput(type, schema.base),
      fields: getOperationDefinitions(schema.base),
    });

    graphql.addFields(getFieldDefinitions(schema.base));

    ResolverFactory(modelInstance)(graphql, schema.base)
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
