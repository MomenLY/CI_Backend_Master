import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProfileFieldDto } from './dto/createProfileField.dto';
import { UpdateProfileFieldDto } from './dto/updateProfileField.dto';
import { ColumnType, ProfileFields } from './entities/profileFields.entity';
import { In, MongoRepository, Repository } from 'typeorm';
import { validate } from 'uuid';
import { TENANT_CONNECTION } from 'src/tenant/tenant.module';
import { ErrorMessages, SuccessMessages } from 'src/utils/messages';
import { isMongoDB, isObjectIdOrUUID } from 'src/utils/helper';
import { ProfileService } from 'src/profile/profile.service';
import { v4 as uuidv4 } from 'uuid';
import { ProfileFieldsMongoService } from './profileFields.mongo.service';
import { ProfileFieldsPostgresService } from './profileFields.postgres.service';

@Injectable()
export class ProfileFieldsService {
  private ProfileFields: Repository<ProfileFields>;
  constructor(
    @Inject(TENANT_CONNECTION) private connection, 
    private readonly profileService: ProfileService,
    private readonly profileFieldsMongoService: ProfileFieldsMongoService,
    private readonly profileFieldsPostgresService: ProfileFieldsPostgresService
  ) {
    this.ProfileFields = this.connection.getRepository(ProfileFields);
  }
  async create(createProfileFieldDto: CreateProfileFieldDto[]) {
    try {
      const latest = await this.ProfileFields.find({
        order: {
          pFOrder: 'DESC',
        },
        take: 1,
      });
      
      for (let i = 0; i < createProfileFieldDto.length; i++) {
        const newOrder = latest && latest[0] ? latest[0].pFOrder + i + 1 : 0;
        createProfileFieldDto[i].pFOrder = newOrder;
        createProfileFieldDto[i].pFColumName =
          createProfileFieldDto[i].pFLabel.toLowerCase().replace(/\s+/g, '_') +
          '_' +
          uuidv4().split('-')[0];
        createProfileFieldDto[i].pFColumType = ColumnType.VARCHAR;
        switch (createProfileFieldDto[i].pFType) {
          case 'date':
            createProfileFieldDto[i].pFColumType = ColumnType.DATE;
            break;
          case 'datetime':
            createProfileFieldDto[i].pFColumType = ColumnType.TIMESTAMP;
            break;
          case 'time':
            createProfileFieldDto[i].pFColumType = ColumnType.TIME;
            break;
          default:
        }
        switch (createProfileFieldDto[i].pFValidation?.type) {
          case 'number':
            createProfileFieldDto[i].pFColumType = ColumnType.INTEGER;
            break;
          case 'json':
            createProfileFieldDto[i].pFColumType = ColumnType.JSONB;
            break;
          default:
        }
      }
      const newProfileField = await this.ProfileFields.save(createProfileFieldDto);
      if (!isMongoDB) {
        await this.profileService.addColumns(newProfileField);
      }
      return newProfileField;
    } catch (error) {
      const msg = error.message.includes('unique constraint')
        ? 'Profile field already exists.'
        : 'Failed to create profile field';
      throw new BadRequestException(msg);
    }
  }

  findAll() {
    return this.ProfileFields.find({ order: { pFOrder: 'ASC' } });
  }

  findActiveFields() {
    return this.ProfileFields.find({ where: { pFStatus: 1 } });
  }

  async findOne(id: string) {
    if (!validate(id)) {
      throw new BadRequestException(
        ErrorMessages.INVALID_UUID_FORMAT + ` : ${id}`,
      );
    }
    const profileField = await this.ProfileFields.findOneBy({ _id: id });

    if (!profileField) {
      throw new NotFoundException(ErrorMessages.PROFILE_FIELD_NOT_FOUND);
    }

    return profileField;
  }

  async update(id: string, updateProfileFieldDto: UpdateProfileFieldDto) {
    const profileField = await this.ProfileFields.findOne({
      where: { _id: id },
    });
    const updatedProfileField = Object.assign(
      profileField,
      updateProfileFieldDto,
    );
    return this.ProfileFields.save(updatedProfileField);
  }

  async batchUpdate(
    profileFieldsToUpdate: UpdateProfileFieldDto[],
  ): Promise<any> {
    const invalidUuids = profileFieldsToUpdate.reduce((acc, dto) => {
      if (!isObjectIdOrUUID(dto._id)) {
        acc.push(dto._id);
      }
      return acc;
    }, []);

    if (invalidUuids.length > 0) {
      throw new BadRequestException(
        ErrorMessages.INVALID_UUID_FORMAT + `: ${invalidUuids.join(', ')}`,
      );
    }
    const existingProfileFields = await this.ProfileFields.findByIds(
      profileFieldsToUpdate.map((dto) => dto._id),
    );
    const notFoundIds = profileFieldsToUpdate
      .filter((dto) => !existingProfileFields.some((pf) => pf._id === dto._id))
      .map((dto) => dto._id);

    if (notFoundIds.length > 0) {
      throw new NotFoundException(
        ErrorMessages.PROFILE_FIELD_NOT_FOUND + ` ${notFoundIds.join(', ')}`,
      );
    }

    const updatedProfileFields = existingProfileFields.map((pf) => {
      const updatedData = profileFieldsToUpdate.find(
        (dto) => dto._id === pf._id.toString(),
      );
      delete updatedData.pFColumName;
      delete updatedData.pFColumType;
      return this.ProfileFields.merge(pf, updatedData);
    });

    return this.ProfileFields.save(updatedProfileFields);
  }

  async remove(ids: string[]) {
    let profileFields = [];
    if(isMongoDB) {
      profileFields = await this.profileFieldsMongoService.findByIds(this.ProfileFields, ids);
    } else {
      profileFields = await this.profileFieldsPostgresService.findByIds(this.ProfileFields, ids);
    }
    if (profileFields.length === 0) {
      throw new NotFoundException(ErrorMessages.NO_RECORD);
    } else {
      await this.ProfileFields.remove(profileFields);
      if (!isMongoDB) {
        await this.profileService.removeColumns(profileFields);
      }
      return SuccessMessages.DELETION_SUCCESS;
    }
  }
}
