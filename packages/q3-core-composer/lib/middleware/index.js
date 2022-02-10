const { Grant } = require('q3-core-access');
const { get, invoke } = require('lodash');

class Session {
  constructor(req) {
    this.method = req.method;
    this.query = get(req, 'query', {});
    this.auth = invoke(req, 'get', 'Authorization');
    this.sessionNonce = invoke(
      req,
      'header',
      'X-Session-Nonce',
    );
  }

  get token() {
    if (!this.auth)
      return this.query.token || this.query.apikey || '';

    return this.auth.startsWith('Apikey') ||
      this.auth.startsWith('Bearer')
      ? this.auth.substr(7)
      : this.auth;
  }

  get nonce() {
    return this.sessionNonce || this.query.nonce;
  }
}

function middleware(UserModel) {
  if (!UserModel)
    throw new Error(
      'Cannot run middleware without User models',
    );

  return async (req, res, next) => {
    const hasMethod = (method) =>
      method in UserModel && !req.user;

    const host = req.get('origin');
    const identity = new Session(req);
    const { token, nonce } = identity;
    const tenant = get(req, 'headers.x-session-tenant');

    if (hasMethod('findbyBearerToken'))
      req.user = await UserModel.findbyBearerToken(
        token,
        nonce,
        host,
        tenant,
      );

    if (hasMethod('findByApiKey'))
      req.user = await UserModel.findByApiKey(
        token,
        tenant,
      );

    req.authorize = (collectionName) =>
      new Grant(req.user)
        .can('Read')
        .on(collectionName)
        .first();

    next();
  };
}

module.exports = middleware;
