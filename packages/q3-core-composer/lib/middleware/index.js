const { Grant } = require('q3-core-access');

class Session {
  constructor(req) {
    this.method = req.method;
    this.auth = req.get('Authorization');
  }

  getToken() {
    if (!this.auth) return '';
    return this.auth.startsWith('Apikey') ||
      this.auth.startsWith('Bearer')
      ? this.auth.substr(7)
      : this.auth;
  }

  setOperation() {
    switch (this.method) {
      case 'PATCH':
      case 'PUT':
        this.op = 'Update';
        break;
      case 'GET':
        this.op = 'Read';
        break;
      case 'POST':
        this.op = 'Create';
        break;
      case 'DELETE':
        this.op = 'Delete';
        break;
      default:
        throw new Error('Method not allowed');
    }

    return this;
  }

  getPermission(collectionName, sessionUser) {
    const gen = (op) =>
      new Grant(sessionUser)
        .can(op)
        .on(collectionName)
        .first();

    const primary = gen(this.op);
    const secondary = gen('Read');

    /**
     * @NOTE
     * Used to redact responses on non-read operations.
     */
    if (primary && secondary)
      primary.readOnly = secondary.fields;

    return primary;
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

    const identity = new Session(req);
    const token = identity.getToken();
    const nonce = req.header('X-Session-Nonce');
    const host = req.get('host');

    if (hasMethod('findbyBearerToken'))
      req.user = await UserModel.findbyBearerToken(
        token,
        nonce,
        host,
      );

    if (hasMethod('findByApiKey'))
      req.user = await UserModel.findByApiKey(
        token,
        nonce,
        host,
      );

    req.authorize = (collectionName) =>
      identity
        .setOperation()
        .getPermission(collectionName, req.user);

    next();
  };
}

module.exports = middleware;
