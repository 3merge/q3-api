const validatorAdapter = require('m2e-validator');
const i18next = require('i18next');
const middleware = require('i18next-express-middleware');
const paginate = require('mongoose-paginate-v2');
const partialSearch = require('mongoose-partial-search');
const commonUtils = require('q3-schema-utils/plugins/common');
const { statusHelpers } = require('q3-core-responder');
const { get } = require('lodash');
const addControllersToRest = require('./controllers');

const customMessageDispatcherMiddleware = (app) => (
  req,
  res,
  next,
) => {
  res.say = (key) => {
    const verb = req.method.toLowerCase();
    const locale = get(app, 'locals.messages', {});
    const namespace = get(
      locale,
      [req.collectionPluralName, req.fieldName, verb]
        .filter(Boolean)
        .join('.'),
    );

    return namespace
      ? req.t(`messages:${namespace}`)
      : req.t(`messages:${key}`);
  };

  next();
};

module.exports = (app, mongoose) => ({
  init() {
    app.use(
      middleware.handle(i18next, {
        removeLngFromUrl: false,
      }),
    );

    app.use(statusHelpers);
    app.use(customMessageDispatcherMiddleware(app));

    mongoose.plugin(commonUtils);
    mongoose.plugin(partialSearch);
    mongoose.plugin(validatorAdapter);
    mongoose.plugin(paginate);
    return this;
  },

  run() {
    Object.values(mongoose.models).forEach(
      addControllersToRest(app),
    );
  },
});
