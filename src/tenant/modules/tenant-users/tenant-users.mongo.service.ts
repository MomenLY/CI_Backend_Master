import { Injectable } from "@nestjs/common";
import { ObjectId } from "mongodb";

@Injectable()
export class TenantUsersMongoService {
  findOne(tenantUserRepository, _id) {
    return tenantUserRepository.findOne({
      where: { _id: new ObjectId(_id) },
    });
  }
  
  deleteTenantUsers(tenantUserRepository, idsArr) {
    return tenantUserRepository.deleteMany({
      userId: { $in: idsArr.map(id => new ObjectId(id)) },
    });
  }
}