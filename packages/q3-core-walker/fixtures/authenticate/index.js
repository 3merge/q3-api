const mock = jest.fn();

const middleware = (req, res, next) => {
  mock();
  next();
};

middleware.mock = mock;
module.exports = middleware;
