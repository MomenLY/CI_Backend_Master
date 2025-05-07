import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateMasterDataDto } from './dto/create-master-data.dto';
import { UpdateMasterDataDto } from './dto/update-master-data.dto';
import { MasterData } from './entities/master-data.entity';
import { Repository } from 'typeorm';
import { validate } from 'class-validator';
import { randomBytes } from 'crypto';
import { TENANT_CONNECTION } from 'src/tenant/tenant.module';
import { isObjectIdOrUUID, validateMasterDataCollectionObject } from 'src/utils/helper';
import { ErrorMessages, SuccessMessages } from 'src/utils/messages';

@Injectable()
export class MasterDataService {
  private MasterData: Repository<MasterData>;
  constructor(@Inject(TENANT_CONNECTION) private connection) {
    this.MasterData = this.connection.getRepository(MasterData);
  }
  async create(createMasterDataDto: CreateMasterDataDto) {
    const errors = await validate(createMasterDataDto);
    if (errors.length > 0) {
      const validationErrors = errors.map((error) =>
        Object.values(error.constraints),
      );
      throw new BadRequestException(validationErrors);
    }

    const mDKey = randomBytes(16).toString('hex');
    const newMasterData = this.MasterData.create({
      ...createMasterDataDto,
      mDKey,
    });
    return this.MasterData.save(newMasterData);
  }

  findAll() {
    return this.MasterData.find();
  }
  async findOne(id: string): Promise<MasterData> {
    if (!isObjectIdOrUUID(id)) {
      throw new BadRequestException(
        ErrorMessages.INVALID_UUID_FORMAT + `: ${id}`,
      );
    }
    const masterData = await this.MasterData.findOneBy({ _id: id });
    if (!masterData) {
      throw new NotFoundException(
        ErrorMessages.MASTERDATA_NOT_FOUND + ` ${id}`,
      );
    }
    return masterData;
  }

  async update(
    id: string,
    updateData: UpdateMasterDataDto,
  ): Promise<MasterData> {
    if (!isObjectIdOrUUID(id)) {
      throw new BadRequestException(
        ErrorMessages.INVALID_UUID_FORMAT + `: ${id}`,
      );
    }
    const masterData = await this.MasterData.findOneBy({ _id: id });
    if (!masterData) {
      throw new NotFoundException(
        ErrorMessages.MASTERDATA_NOT_FOUND + ` ${id}`,
      );
    }
    const updatedMasterData = this.MasterData.merge(masterData, updateData);
    return this.MasterData.save(updatedMasterData);
  }

  async batchUpdate(masterDataToUpdate: UpdateMasterDataDto[]): Promise<any> {
    const invalidUuids = masterDataToUpdate.reduce((acc, dto) => {
      if (!isObjectIdOrUUID(dto._id)) {
        acc.push(dto._id);
      }
      return acc;
    }, []);

    if (invalidUuids.length > 0) {
      throw new BadRequestException(
        ErrorMessages.INVALID_UUID_FORMAT +
          ` for IDs: ${invalidUuids.join(', ')}`,
      );
    }

    const existingMasterData = await this.MasterData.findByIds(
      masterDataToUpdate.map((dto) => dto._id),
    );
    const notFoundIds = masterDataToUpdate
      .filter((dto) => !existingMasterData.some((md) => md._id === dto._id))
      .map((dto) => dto._id);

    if (notFoundIds.length > 0) {
      throw new NotFoundException(
        ErrorMessages.MASTERDATA_NOT_FOUND + ` ${notFoundIds.join(', ')}`,
      );
    }

    for (const masterDataObject of masterDataToUpdate) {
      if (masterDataObject?.mDDataCollections) {
        if (
          !(masterDataObject.mDDataCollections instanceof Object) ||
          Array.isArray(masterDataObject.mDDataCollections) ||
          validateMasterDataCollectionObject(
            masterDataObject.mDDataCollections,
          ) === false
        ) {
          throw new BadRequestException(
            ErrorMessages.MDDATACOLLECTIONS_MUST_BE_AN_OBJECT,
          );
        }
      }
    }

    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    let updateCount = 0;
    try {
      for (const masterDataObject of masterDataToUpdate) {
        const _masterData = await queryRunner.manager
          .getRepository(MasterData)
          .findOne({
            where: {
              _id: masterDataObject._id,
            },
          });
        if (_masterData) {
          if (masterDataObject.mDName) {
            _masterData.mDName = masterDataObject.mDName;
          }
          if (masterDataObject.mDDataCollections) {
            _masterData.mDDataCollections = masterDataObject.mDDataCollections;
          }
          await queryRunner.manager.getRepository(MasterData).save(_masterData);
          updateCount++;
        }
      }
      await queryRunner.commitTransaction();
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw e;
    } finally {
      await queryRunner.release();
    }

    return { updateCount, message: SuccessMessages.MASTER_DATA_UPDATE_SUCCESS };
  }

  async remove(id: string): Promise<any> {
    if (!isObjectIdOrUUID(id)) {
      throw new BadRequestException(
        ErrorMessages.INVALID_UUID_FORMAT + `: ${id}`,
      );
    }
    const masterData = await this.MasterData.findOneBy({ _id: id });
    if (!masterData) {
      throw new NotFoundException(
        ErrorMessages.MASTERDATA_NOT_FOUND + ` ${id}`,
      );
    }
    await this.MasterData.remove(masterData);
    return SuccessMessages.RECORD_DELETION_SUCCESS;
  }
}
