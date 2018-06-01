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

import * as validator from 'validator';
import { Validator, ValidationResult } from './';
import { getLocaleString } from '../../shared/localization';
import { parseFullName } from 'parse-full-name';

export class UserValidator extends Validator {
  constructor(context: any) {
    super(getLocaleString('InvalidUserInfo', context), context);

    this.addValidators({
      email: this.validateEmail,
      fullName: this.validateFullName,
      password: this.validatePassword,
      oldPassword: this.validatePassword,
      newPassword: this.validatePassword,
    });
  }

  /**
   * Checks an email and ensure it can fix in the database and is valid.
   * @param email
   */
  validateEmail(email: string): ValidationResult {
    const min = 6;
    const max = 190;

    if (!validator.isLength(email, { min, max })) {
      return {
        result: false,
        e: new Error(getLocaleString('InvalidEmailLength', this.context, { min, max })),
      };
    }

    if (!validator.isEmail(email)) {
      return {
        result: false,
        e: new Error(getLocaleString('InvalidEmail', this.context)),
      };
    }

    return { result: true };
  }

  /**
   * Checks a name's length to ensure it fits in the database.
   * @param fullName
   */
  validateFullName(fullName: string): ValidationResult {
    const min = 4;
    const max = 190;

    if (!validator.isLength(fullName, { min, max })) {
      return {
        result: false,
        e: new Error(getLocaleString('InvalidNameLength', this.context, { min, max })),
      };
    }

    return { result: true };
  }

  /**
   * Checks that a provided password won't take ages to hash (DoS prevention).
   * http://permalink.gmane.org/gmane.comp.python.django.devel/39831
   * @param password
   */
  validatePassword(password: string): ValidationResult {
    const min = 8;
    const max = 4096;

    // No funky special character nonsense. Upper bound on password prevents
    // DoS: http://permalink.gmane.org/gmane.comp.python.django.devel/39831
    if (!validator.isLength(password, { min, max })) {
      return {
        result: false,
        e: new Error(getLocaleString('InvalidPasswordLength', this.context, { min, max })),
      };
    }

    return { result: true };
  }
}
