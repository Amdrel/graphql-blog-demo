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

import { getLocaleString } from './localization';

const permissionRegex = /^([^\.]|([^\.])\.[^\.])*$/;

/**
 * A list of terms created from a dot delimited string that can be used to
 * represent a hierarchy of permissions.
 */
export class Permission {
  nodes: string[];

  /**
   * Constructs a permissions object from a dot delimited string.
   * @param permission A string representation of the permission.
   */
  constructor(permission: string) {
    if (!permissionRegex.test(permission)) {
      throw new Error(getLocaleString('InvalidPermissionString'));
    }

    this.nodes = permission.split('.');
  }

  /**
   * Compares permission terms so that if all match up to their shared length,
   * they match. This is better explained by example:
   *
   * top.mid.low = top.mid.low
   * top.mid     = top.mid.low
   * other.top   ≠ top.mid.low
   *
   * @param permission Another permission to compare to.
   */
  match(permission: Permission): boolean {
    const length = Math.min(this.nodes.length, permission.nodes.length);

    for (let i = 0; i < length; i += 1) {
      if (this.nodes[i] !== permission.nodes[i]) {
        return false;
      }
    }

    return true;
  }

  /**
   * Returns a string representation of the permission. This is useful for
   * serialization (as is done in our JWT creation code).
   */
  stringify(): string {
    return this.nodes.join('.');
  }
}
