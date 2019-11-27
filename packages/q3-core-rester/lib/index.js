const Controller = require('./restDocuments');
const SubController = require('./restSubDocuments');

module.exports = (app, mongoose) => ({
  validateModelOptions(model = {}) {
    if (!('schema' in model))
      throw new Error('Model constructor not provided');

    const {
      collection: { collectionName },
      schema,
    } = model;

    const requiredOptions = [
      'collectionPluralName',
      'collectionSingularName',
      'restify',
    ];

    return requiredOptions.reduce(
      (a, curr) => {
        const val = schema.get(curr);
        if (!val)
          throw new Error(
            `Missing ${curr} schema option on ${collectionName}`,
          );

        return Object.assign(a, {
          [curr]: val,
        });
      },
      {
        collectionName,
      },
    );
  },

  configController(Model) {
    app.use(
      Controller({
        ...this.validateModelOptions(Model),
        Model,
      }),
    );
  },

  configSubController(Model) {
    const {
      schema: { childSchemas = [] },
      collection: { collectionName },
    } = Model;
    childSchemas.forEach(({ model: { path } }) => {
      app.use(
        SubController({
          Model,
          field: path,
          collectionName,
        }),
      );
    });
  },

  run() {
    Object.values(mongoose.models).forEach((mod) => {
      this.configController(mod);
      this.configSubController(mod);
    });
  },
});
