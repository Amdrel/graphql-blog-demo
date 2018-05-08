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

    // it('should match literal permissions that match exactly', () => {
    // });

    // it('should match literal permissions that match exactly', () => {
    // });
  });
});
