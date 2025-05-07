import { Injectable } from "@nestjs/common";
import { In } from "typeorm";

@Injectable()
export class ProfileFieldsPostgresService {
  findByIds(ProfileFields, ids) {
    return ProfileFields.find({ where: { _id: In(ids) } });
  }
}