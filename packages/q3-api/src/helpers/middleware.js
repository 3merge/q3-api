import customErrorMatcher from './errors';

const statusCodeHelper = (res) => (code) => (body = {}) => {
  res.status(code).json(body);
};

const decorateResponse = (req, res, next) => {
  const dispatch = statusCodeHelper(res);
  res.acknowledge = dispatch(204);
  res.ok = dispatch(200);
  res.update = dispatch(200);
  res.create = dispatch(201);
  next();
};

// eslint-disable-next-line
const handleUncaughtErrors = (err, req, res, next) => {
  res.status(customErrorMatcher(err.name)).json(err);
};

export default decorateResponse;
export { handleUncaughtErrors };
