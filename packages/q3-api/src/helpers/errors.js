/* eslint max-classes-per-file: 0  */

export default (name) => {
  switch (name) {
    case 'BadRequestError':
      return 400;
    case 'AuthenticationError':
      return 401;
    case 'AuthorizationError':
      return 403;
    case 'ResourceNotFoundError':
      return 404;
    case 'ValidationError':
      return 422;
    case 'ConflictError':
      return 409;
    default:
      return 500;
  }
};

export class BadRequestError extends Error {
  constructor(message) {
    super();
    this.name = this.constructor.name;
    this.message = message;
  }
}

export class AuthenticationError extends Error {
  constructor(message) {
    super();
    this.name = this.constructor.name;
    this.message = message;
  }
}

export class AuthorizationError extends Error {
  constructor(message) {
    super();
    this.name = this.constructor.name;
    this.message = message;
  }
}

export class ValidationError extends Error {
  constructor(errors) {
    super();
    this.name = this.constructor.name;
    this.errors = errors;
  }
}

export class ResourceNotFoundError extends Error {
  constructor() {
    super();
    this.name = this.constructor.name;
  }
}

export class ConflictError extends Error {
  constructor(message, err) {
    super();
    this.name = this.constructor.name;
    this.message = message;
    this.error = err;
  }
}
