/* eslint-disable max-classes-per-file */

const MODEL_NAMES = {
  USERS: 'q3-api-users',
  PERMISSIONS: 'q3-api-permissions',
  LOGS: 'q3-api-logs',
  VERSIONS: 'q3-api-versions',
};

const ERRORS = {
  BadRequestError: class extends Error {
    constructor(message) {
      super();
      this.name = this.constructor.name;
      this.message = message;
    }
  },

  AuthenticationError: class extends Error {
    constructor(message) {
      super();
      this.name = this.constructor.name;
      this.message = message;
    }
  },

  AuthorizationError: class extends Error {
    constructor(message) {
      super();
      this.name = this.constructor.name;
      this.message = message;
    }
  },

  ValidationError: class extends Error {
    constructor(errors) {
      super();
      this.name = this.constructor.name;
      this.errors = errors;
    }
  },

  ResourceNotFoundError: class extends Error {
    constructor() {
      super();
      this.name = this.constructor.name;
    }
  },

  ConflictError: class extends Error {
    constructor(message, err) {
      super();
      this.name = this.constructor.name;
      this.message = message;
      this.error = err;
    }
  },
};

module.exports = {
  ERRORS,
  MODEL_NAMES,
};
