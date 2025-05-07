import {
  AbilityBuilder,
  MongoAbility,
  createMongoAbility,
} from '@casl/ability';
import { Injectable } from '@nestjs/common';
import { User } from 'src/users/entities/user.entity';

export type AppAbility = MongoAbility;

@Injectable()
export class CaslAbilityFactory {
  createForUser(user: User) {
    const { can, cannot, build } = new AbilityBuilder(createMongoAbility);
    const aclKeys = user.acl ? Object.keys(user.acl) : [];
    for (const aclKey of aclKeys) {
      const aclFeatureKeys = Object.keys(user.acl[aclKey]);
      for (const aclFeatureKey of aclFeatureKeys) {
        if (user.acl[aclKey][aclFeatureKey].permission) {
          can(aclFeatureKey, aclKey);
        } else {
          cannot(aclFeatureKey, aclKey);
        }
      }
    }
    return build();
  }
}
