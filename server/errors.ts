export const isUserError = Symbol();

export class UserError extends Error {
  isUserError: Symbol;

  constructor(...args: any[]) {
    super(...args);
    this.name = 'UserError';
    this.message = args[0];
    this.isUserError = isUserError;
    Error.captureStackTrace(this);
  }
}

export class ValidationError extends UserError {
  constructor(...args: any[]) {
    super(...args);
    this.name = 'ValidationError';
  }
}
