const { MODEL_NAMES } = require('../constants');
const mongoose = require('../config/mongoose');
const app = require('../config/express');
const { verifyToken } = require('../models/user/helpers');

const middleware = async (req, res, next) => {
  const User = mongoose.model(MODEL_NAMES.USERS);

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

  if (req.user && req.user.lang && req.tChange) {
    await req.tChange(req.user.lang);
  }

  next();
};

app.use(middleware);
module.exports = middleware;
