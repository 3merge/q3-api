const app = require('../config/express');
const controller = require('./controller');
const controllerDocumentArray = require('./controllerSubDocument');
const validationMap = require('../helpers/m2e.adapter');

module.exports = (Model) => {
  const {
    collection: { collectionName },
    schema,
  } = Model;

  const full = validationMap(Model.schema, true);
  const lean = validationMap(Model.schema, false);

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
      collectionName,
      collectionPluralName,
      collectionSingularName,
      discriminatorKey,
      validationSchema: {
        post: full.paths,
        patch: lean.paths,
      },
    }),
  );

  /**
   * @TODO
   * How to make this recursive?
   */
  Object.entries(full.subpaths).forEach(
    ([subpath, subpathValidation]) =>
      app.use(
        controllerDocumentArray({
          Model,
          field: subpath,
          collectionName,
          discriminatorKey,
          validationSchema: {
            post: subpathValidation,
            patch: lean.subpaths[subpath],
          },
        }),
      ),
  );
};
