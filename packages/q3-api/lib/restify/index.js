require('./adapter');
const app = require('../config/express');
const controller = require('./controller');
const controllerDocumentArray = require('./controllerSubDocument');

module.exports = (Model) => {
  const {
    collection: { collectionName },
    schema,
  } = Model;
  const { paths, subpaths } = Model.getValidation();
  const discriminatorKey = schema.get('discriminatorKey');
  const restify = schema.get('restify');

  const collectionPluralName = schema.get(
    'collectionPluralName',
  );

  const collectionSingularName = schema.get(
    'collectionSingularName',
  );

  if (typeof restify !== 'string') return;

  if (!collectionPluralName || !collectionSingularName)
    throw new Error(
      `Missing rest names on ${collectionName}`,
    );

  app.use(
    controller({
      Model,
      restify,
      validationSchema: paths,
      collectionName,
      collectionPluralName,
      collectionSingularName,
      discriminatorKey,
    }),
  );

  /**
   * @TODO
   * How to make this recursive?
   */
  Object.entries(subpaths).forEach(
    ([subpath, subpathValidation]) =>
      app.use(
        controllerDocumentArray({
          Model,
          field: subpath,
          validationSchema: subpathValidation,
          collectionName,
          discriminatorKey,
        }),
      ),
  );
};
