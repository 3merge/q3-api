const { model } = require('..');
const { MODEL_NAMES } = require('../constants');
const app = require('../config/express');
const { verifyToken } = require('../models/user/helpers');

const middleware = async (req, res, next) => {
  const User = model(MODEL_NAMES.USERS);
  let err;

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

  next(err);
};

app.use(middleware);
module.exports = middleware;
