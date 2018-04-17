export const isUserError = Symbol();

export class UserError extends Error {
  constructor(...args: any[]) {
    super(...args);
    this.name = 'UserError';
    this.message = args[0];
    Error.captureStackTrace(this);
  }
}

export class ValidationError extends UserError {
  constructor(...args: any[]) {
    super(...args);
    this.name = 'ValidationError';
  }
}
