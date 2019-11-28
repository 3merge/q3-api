const validatorAdapter = require('m2e-validator');
const paginate = require('mongoose-paginate-v2');
const partialSearch = require('mongoose-partial-search');
const decorators = require('q3-route-decorators');
const addControllersToRest = require('./controllers');

module.exports = (app, mongoose) => ({
  init() {
    app.use(decorators);
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
