const decorators = jest
  .fn()
  .mockImplementation((req, res, next) => next());

// eslint-disable-next-line
decorators.handleUncaughtErrors = (err, req, res, next) => {
  // eslint-disable-next-line
  console.log(err);
  next();
};

module.exports = decorators;
