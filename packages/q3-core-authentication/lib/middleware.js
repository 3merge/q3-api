const { model, exception, t } = require('q3-api');
const { verifyToken } = require('./tokens');
const { MODEL_NAME } = require('./constants');

const middleware = async (req, res, next) => {
  const User = model(MODEL_NAME);

  req.user = await verifyToken(
    req.header('Authorization'),
    req.header('exp-nonce'),
    req.get('host'),
    User,
  );

  if (!req.user) {
    req.user = await User.findByApiKey(
      req.header('Authorization'),
    );
  }

  next();
};

middleware.enforceLogin = async (req, res, next) => {
  let err;
  if (!req.user)
    err = next(
      exception('AuthenticationError').boomerang(
        t('errors:login'),
      ),
    );

  next(err);
};

module.exports = middleware;
