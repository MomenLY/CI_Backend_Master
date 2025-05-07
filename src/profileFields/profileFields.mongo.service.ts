import { Injectable } from "@nestjs/common";
import { ObjectId } from "mongodb";

@Injectable()
export class ProfileFieldsMongoService {
  findByIds(ProfileFields, ids) {
    return ProfileFields.find({ where: { _id: ids.map(id => new ObjectId(id)) } });
  }
}