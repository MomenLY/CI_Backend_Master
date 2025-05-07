import { IsIn, IsNotEmpty, IsObject, IsString } from 'class-validator';
import { Role, RoleType } from '../entities/role.entity';

export class AclDto {
  @IsObject()
  @IsNotEmpty()
  users: {
    viewUsers: { label: string; permission: boolean };
    addUser: { label: string; permission: boolean };
    editUser: { label: string; permission: boolean };
    deleteUser: { label: string; permission: boolean };
    exportUsers: { label: string; permission: boolean };
    importUsers: { label: string; permission: boolean };
    inviteUsers: { label: string; permission: boolean };
    loginAsUser: { label: string; permission: boolean };
    permissions: { label: string; permission: boolean };
  };
  @IsObject()
  @IsNotEmpty()
  groups: {
    viewGroups: { label: string; permission: boolean };
    editGroup: { label: string; permission: boolean };
    addGroup: { label: string; permission: boolean };
    deleteGroup: { label: string; permission: boolean };
    exportGroups: { label: string; permission: boolean };
  };
}

export class CreateRoleDto {
  @IsString()
  @IsNotEmpty()
  name: string;
  @IsString()
  @IsNotEmpty()
  roleType: RoleType;
  @IsObject()
  @IsNotEmpty()
  acl: any;
  @IsIn([0,1], {message: "IsDefault can only be either 0 or 1"})
  areIsDefault: number
}

export class RoleDto {
  _id: string;
  name: string;
  roleType: RoleType;
  acl: AclDto;

  constructor(role?: Partial<Role>) {
    if (role) {
      this._id = role._id;
      this.name = role.name;
      this.roleType = role.roleType;
      this.acl = role.acl;
    }
  }
}