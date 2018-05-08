import { getLocaleString } from './localization';

const permissionRegex = /^([^\.]|([^\.])\.[^\.])*$/;

export class Permission {
  nodes: string[];

  constructor(permission: string) {
    if (!permissionRegex.test(permission)) {
      throw new Error(getLocaleString('InvalidPermissionString'));
    }

    this.nodes = permission.split('.');
  }

  match(permission: Permission): boolean {
    return false;
  }
}
