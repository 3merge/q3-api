const ctx = require('request-context');
const { MODEL_NAMES } = require('../constants');
const mongoose = require('../config/mongoose');
const app = require('../config/express');
const { verifyToken } = require('../models/user/helpers');

const isApiKey = (s = '') =>
  s.startsWith('Apikey') ? s.substr(7) : s;

const middleware = async (req, res, next) => {
  const User = mongoose.model(MODEL_NAMES.USERS);
  const auth = req.header('Authorization');

  req.user = await verifyToken(
    auth,
    req.header('exp-nonce'),
    req.get('host'),
    User,
  );

  if (!req.user) {
    req.user = await User.findByApiKey(isApiKey(auth));
  }

  if (req.user && req.user.lang && req.tChange) {
    await req.tChange(req.user.lang);
  }

  ctx.set('q3-session:user', req.user);
  next();
};

app.use(middleware);
module.exports = middleware;
