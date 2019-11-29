require('q3-schema-types');
const mongoose = require('mongoose');

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

jest.mock('request-context', () => ({
  middleware: () => (req, res, next) => next(),
  get: jest.fn(),
  set: jest.fn(),
}));
