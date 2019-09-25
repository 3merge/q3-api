const decorators = jest
  .fn()
  .mockImplementation((req, res, next) => next());

// eslint-disable-next-line
const handleUncaughtErrors = (err, req, res, next) => {
  // eslint-disable-next-line
  console.log(err);
  next();
};

export default decorators;
export { handleUncaughtErrors };
