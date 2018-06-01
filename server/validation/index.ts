// MIT License
//
// Copyright (c) 2018 Walter Kuppens
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

import { ValidationError } from '../errors';

type ValidationFunction = (input: any) => ValidationResult;

interface ArgumentMapper {
  [arg: string]: ValidationFunction;
}

interface Arguments {
  [arg: string]: any;
}

export interface ValidationResult {
  result: boolean;
  e?: Error;
}

/**
 * Validator that can extended with custom validation functions.
 */
export class Validator {
  validators: ArgumentMapper;
  message: string;
  context: any;

  /**
   * Initialize a validator with default validation functions. Validators can
   * inherit other validators' validation functions if `super()` is used
   * properly.
   *
   * @param mesage Custom message to attach to the ValidationError.
   */
  constructor(mesage: string, context: any) {
    this.validators = {};
    this.message = mesage;
    this.context = context;
  }

  /**
   * Adds additional validation functions to the validator. This allows runtime
   * modification of validators that's useful when additional validation may
   * need to be ran in certain circumstances.
   *
   * For example, an admin may be able to change a user's password without
   * providing it. To make this work you'd not have the password validator be
   * included by default. If the user isn't an admin however, `addValidators()`
   * can be called with the password validation function before calling
   * `validate()` to ensure it's checked.
   *
   * @param validators A mapping of arg names to validator functions.
   * @returns Itself to allow method chaining.
   */
  addValidators(validators: ArgumentMapper): Validator {
    this.validators = Object.assign(this.validators, validators);
    return this; // Allow chaining.
  }

  /**
   * Runs all validators against arguments. Arguments that are undefined are
   * not validated. Validators are used on GraphQL inputs which support null
   * checking already.
   *
   * @param args Arguments to validate.
   */
  validate(args: Arguments) {
    // Run validation functions on present supported arguments.
    const argKeys = Object.keys(args);
    const results: ValidationResult[] = Object.keys(this.validators)
      .filter(key => argKeys.indexOf(key) > -1)
      .sort()
      .map(key => this.validators[key](args[key]));

    // Aggregate errors from the validator results.
    const errors: Error[] = results
      .filter(r => !r.result && r.e != null)
      .map(r => r.e) as Error[];

    // Throw with a list of errors if any happened.
    if (errors.length > 0) {
      throw new ValidationError({ errors, message: this.message });
    }
  }
}
