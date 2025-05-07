export class CreateTenantDto {
  user: Tenant[];
}

export interface Tenant {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}
