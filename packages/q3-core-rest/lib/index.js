const validatorAdapter = require('m2e-validator');
const i18next = require('i18next');
const middleware = require('i18next-express-middleware');
const paginate = require('mongoose-paginate-v2');
const partialSearch = require('mongoose-partial-search');
const commonUtils = require('q3-schema-utils/plugins/common');
const { statusHelpers } = require('q3-core-responder');
const addControllersToRest = require('./controllers');

module.exports = (app, mongoose) => ({
  init() {
    app.use(
      middleware.handle(i18next, {
        removeLngFromUrl: false,
      }),
    );

    app.use(statusHelpers);
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
