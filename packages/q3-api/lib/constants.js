const MODEL_NAMES = {
  USERS: 'q3-api-users',
  PERMISSIONS: 'q3-api-permissions',
  LOGS: 'q3-api-logs',
  VERSIONS: 'q3-api-versions',
};

const ERRORS = {
  BadRequestError: 'BadRequestError',
  AuthenticationError: 'AuthenticationError',
  AuthorizationError: 'AuthorizationError',
  ValidationError: 'ValidationError',
  ResourceNotFoundError: 'ResourceNotFoundError',
  ConflictError: 'ConflictError',
};

const CONTEXT = {
  LOCALE: 'q3-session:locale',
  USER: 'q3-session:user',
  PERMISSIONS: 'q3-session:grants',
};

module.exports = {
  ERRORS,
  MODEL_NAMES,
  CONTEXT,
};
