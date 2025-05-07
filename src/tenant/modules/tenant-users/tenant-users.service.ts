import { Injectable } from '@nestjs/common';
import { DataSource, MongoRepository, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateTenantUserDto } from './dto/create-tenant-user.dto';
import { UpdateTenantUserDto } from './dto/update-tenant-user.dto';
import { TenantUser } from './entities/tenant-user.entity';
import { ObjectId } from 'mongodb';
import { getCache } from 'memcachelibrarybeta';
import { isMongoDB } from 'src/utils/helper';
import { TenantUsersMongoService } from './tenant-users.mongo.service';
import { TenantUsersPostgresService } from './tenant-users.postgres.service';

@Injectable()
export class TenantUsersService {
  constructor(
    @InjectRepository(TenantUser)
    private userRepository: Repository<TenantUser> &
      MongoRepository<TenantUser>,
    private userMongoService: TenantUsersMongoService,
    private userPostgresService: TenantUsersPostgresService,
    private readonly mainDataSource: DataSource,
  ) {}

  async findOne(_id: any): Promise<TenantUser> {
    const getUserById = async (_id: any) => {
      if (isMongoDB) {
        return this.userMongoService.findOne(this.userRepository, _id);
      }
      return this.userPostgresService.findOne(this.userRepository, _id);
    };
    return getCache(_id, getUserById, _id);
  }

  async findOneByEmail(email: string): Promise<TenantUser> {
    return this.userRepository.findOne({ where: { email } });
  }

  async saveTenantUsers(tenantUsersToSave: TenantUser[]): Promise<TenantUser[]> {
    return this.userRepository.save(tenantUsersToSave, { chunk: 1000 })
  }

  async updateTenantUsers(tenantUserArray: TenantUser[]) {
    const queryRunnerMain = this.mainDataSource.createQueryRunner();
    await queryRunnerMain.connect();
    await queryRunnerMain.startTransaction();
    try {
      for (const user of tenantUserArray) {
        const { userId, name, email } = user;
        await queryRunnerMain.manager
          .getRepository(TenantUser)
          .update({ userId: userId }, { name, email });
      }

      await queryRunnerMain.commitTransaction();
    } catch (e) {
      await queryRunnerMain.rollbackTransaction();
      throw e;
    } finally {
      await queryRunnerMain.release();
    }
  }

  deleteTenantUsers(idsArr: string[]) {
    if (isMongoDB) {
      return this.userMongoService.deleteTenantUsers(this.userRepository, idsArr);
    } else {
      return this.userPostgresService.deleteTenantUsers(this.userRepository, idsArr);
    }
  }

}
