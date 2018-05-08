import { getLocaleString } from './localization';

const permissionRegex = /^([^\.]|([^\.])\.[^\.])*$/;

/**
 * A list of terms created from a dot delimited string that can be used to
 * represent a hierarchy of permissions.
 */
export class Permission {
  nodes: string[];

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
   * @param permission
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
}
