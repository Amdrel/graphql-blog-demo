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

import { expect } from 'chai';
import { Permission } from './permissions';

describe('shared functions used by client and server', () => {
  describe('test permissions validation and matching', () => {
    it('should create a basic Permission object without error', () => {
      expect(() => {
        const permission = new Permission('top.mid.low');
      }).to.not.throw(Error);
    });

    it('should not allow double dots in permissions', () => {
      expect(() => {
        const permission = new Permission('top..mid.low');
      }).to.throw(Error);
    });

    it('should not allow leading dots in permissions', () => {
      expect(() => {
        const permission = new Permission('.top.mid.low');
      }).to.throw(Error);
    });

    it('should not allow trailing dots in permissions', () => {
      expect(() => {
        const permission = new Permission('top.mid.low.');
      }).to.throw(Error);
    });

    it('should not allow combinations of the former', () => {
      expect(() => {
        const permission = new Permission('..top..mid.low..');
      }).to.throw(Error);
    });

    it('should match literal permissions that match exactly', () => {
      const permission1 = new Permission('top.mid.low');
      const permission2 = new Permission('top.mid.low');
      expect(permission1.match(permission2)).to.be.true;
    });

    it('should match literal permissions that have less terms', () => {
      const permission1 = new Permission('top.mid.low');
      const permission2 = new Permission('top.mid');
      expect(permission1.match(permission2)).to.be.true;
    });

    it('should not match literal permissions with mismatched terms', () => {
      const permission1 = new Permission('top.mid.low');
      const permission2 = new Permission('topper.top.mid.low');
      expect(permission1.match(permission2)).to.be.false;

      const permission3 = new Permission('other.top');
      expect(permission1.match(permission3)).to.be.false;
    });

    it('should not match empty permissions', () => {
      const permission1 = new Permission('top.mid.low');
      const permission2 = new Permission('');
      expect(permission1.match(permission2)).to.be.false;
    });

    it('should stringify back to its source string', () => {
      const permission1 = new Permission('top.mid.low');
      expect(permission1.stringify()).to.equal('top.mid.low');

      const permission2 = new Permission('top');
      expect(permission2.stringify()).to.equal('top');
    });
  });
});
