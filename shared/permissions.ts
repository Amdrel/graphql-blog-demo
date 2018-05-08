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
   * @param permission - A string representation of the permission.
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
   * @param permission - Another permission to compare to.
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
