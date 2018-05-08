import { expect, assert } from 'chai';
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
      assert.isTrue(permission1.match(permission2));
    });

    it('should match literal permissions have less terms', () => {
      const permission1 = new Permission('top.mid.low');
      const permission2 = new Permission('top.mid');
      assert.isTrue(permission1.match(permission2));
    });

    it('should not match literal permissions mismatched terms', () => {
      const permission1 = new Permission('top.mid.low');
      const permission2 = new Permission('topper.top.mid.low');
      assert.isFalse(permission1.match(permission2));

      const permission3 = new Permission('other.top');
      assert.isFalse(permission1.match(permission3));
    });

    it('should not match empty permissions', () => {
      const permission1 = new Permission('top.mid.low');
      const permission2 = new Permission('');
      assert.isFalse(permission1.match(permission2));
    });
  });
});
