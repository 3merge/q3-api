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

  setUser(user) {
    this.role = user ? user.role : 'Public';
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
  }

  async getPermission(Model, collectionName) {
    if (!('hasGrant' in Model)) return null;
    return Model.hasGrant(
      collectionName,
      this.op,
      this.role,
    );
  }
}

function middleware(UserModel, PermissionModel) {
  if (!UserModel || !PermissionModel)
    throw new Error(
      'Cannot run middleware without User and Permission models',
    );

  return async (req, res, next) => {
    const hasMethod = (method) =>
      method in UserModel && !req.user;

    const identity = new Session(req);
    const token = identity.getToken();
    const nonce = req.header('token-nonce');
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

    req.authorize = (name) => {
      identity.setUser(req.user);
      identity.setOperation();
      return identity.getPermission(PermissionModel, name);
    };

    next();
  };
}

module.exports = middleware;
