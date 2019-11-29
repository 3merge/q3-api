const Controller = require('./root');
const SubController = require('./sub');

module.exports = (app) => (Model) => {
  if (!app)
    throw new Error('Router required to register routes');

  if (!('schema' in Model))
    throw new Error('Model constructor not provided');

  const { schema } = Model;
  const { childSchemas = [] } = schema;

  if (
    ![
      'collectionPluralName',
      'collectionSingularName',
      'restify',
    ].every(Model.schema.get.bind(schema))
  ) {
    // eslint-disable-next-line
    console.warn(
      `${Model.collection.collectionName} not added to REST`,
    );
    return;
  }

  app.use(new Controller(Model).exec());

  childSchemas.forEach(({ model: { path } }) =>
    app.use(new SubController(Model, path).exec()),
  );
};
