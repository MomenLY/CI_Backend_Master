import { Injectable } from "@nestjs/common";
import { ObjectId } from "mongodb";

@Injectable()
export class UsersMongoHelper {
  async insertProfileFields(connection, newProfileFieldsToSave) {
    const queryRunner = connection.createQueryRunner();
    // Start a transaction
    await queryRunner.startTransaction();
    try {
      await queryRunner.insertMany('profile', newProfileFieldsToSave)
      await queryRunner.commitTransaction();
    } catch (error) {
      // Rollback changes in case of an error
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Release the query runner
      await queryRunner.release();
    }
  }

  updateProfileField(queryRunner, _id, profileFieldsToSaveObject) {
    return queryRunner.updateOne('profile', { userId: new ObjectId(_id) }, { $set: profileFieldsToSaveObject[_id] }, { upsert: true });
  }

  findUsersByEmails(userRepository, emailsArr) {
    return userRepository.find({
      where: { email: { $in: emailsArr } },
    });
  }

  findRolesByIds(roleRepository, roleChunk) {
    return roleRepository.find({
      where: { _id: { $in: roleChunk.map(id => new ObjectId(id)) } }, 
      select: ['_id', 'roleType'],
    });
  }

  findUserById(userRepository, _id) {
    return userRepository.findOne({ where: { _id: new ObjectId(_id) } });
  }
}