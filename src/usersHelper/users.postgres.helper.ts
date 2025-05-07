import { Injectable } from "@nestjs/common";
import { splitArray } from "src/utils/helper";
import { In } from "typeorm";

@Injectable()
export class UsersPostgresHelper {
  async insertProfileFields(connection, newProfileFieldsToSave) {
    const queryRunner = connection.createQueryRunner();
    const hasProfileTable = await queryRunner.hasTable('profile');
    await queryRunner.release();
    if (hasProfileTable) {
      const newProfileFieldsToSaveChunks = splitArray(newProfileFieldsToSave, 1000);
      for (const newProfileFieldsToSaveChunk of newProfileFieldsToSaveChunks) {
        await connection
          .createQueryBuilder()
          .insert()
          .into('profile') // name of the table
          .values(newProfileFieldsToSaveChunk)
          .execute();
      }
    }
  }

  async updateProfileField(queryRunner, _id, profileFieldsToSaveObject) {
    const hasProfileTable = await queryRunner.hasTable('profile');
    if (hasProfileTable) {
      const profileToUpdateKeys = Object.keys(profileFieldsToSaveObject[_id]).map((key, i) => `"${key}"`);
      const profileToUpdateKeysFormatted = profileToUpdateKeys.map((key, i) => `${key} = EXCLUDED.${key}`);
      const profileToUpdateValues = Object.values(profileFieldsToSaveObject[_id]);
      await queryRunner.query(
        `INSERT INTO profile(${profileToUpdateKeys.join()}, "userId") VALUES(${profileToUpdateValues.map((v, i) => `$${i + 1}`)}, $${profileToUpdateValues.length + 1}) ON CONFLICT("userId") DO UPDATE SET ${profileToUpdateKeysFormatted.join()}`,
        [...profileToUpdateValues, _id]  // Parameterized query to prevent SQL injection
      );
    }
  }

  findUsersByEmails(userRepository, emailsArr) {
    return userRepository.find({
      where: { email: In(emailsArr) },
    });
  }

  findRolesByIds(roleRepository, roleChunk) {
    console.log(roleChunk, "roleChunk");
    return roleRepository.find({
      where: { _id: In(roleChunk) }, 
      select: ['_id', 'roleType'],
    });
  }

  findUserById(userRepository, _id) {
    return userRepository.findOne({ where: { _id: _id } });
  }
}