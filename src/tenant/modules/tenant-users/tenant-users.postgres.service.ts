import { Injectable } from "@nestjs/common";
import { In } from "typeorm";

@Injectable()
export class TenantUsersPostgresService {
  findOne(tenantUserRepository, _id) {
    return tenantUserRepository.findOne({ where: { _id: _id } });
  }

  deleteTenantUsers(tenantUserRepository, idsArr) {
    return tenantUserRepository.delete({ userId: In(idsArr) });
  }
}