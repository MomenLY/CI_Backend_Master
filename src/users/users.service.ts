import {
  BadRequestException,
  HttpException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
  CreateBulkDto,
  CreateUserDto,
  ForgotPasswordDTO,
  ResetPasswordDTO,
  UserDto,
} from './dto/create-user.dto';
import { ILike, In, MongoRepository, Not, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from '@node-rs/bcrypt';
import {
  getDurationBetweenDates,
  isMongoDB,
  isObjectIdOrUUID,
} from 'src/utils/helper';
import { IDENTIFY_TENANT_FROM_PRIMARY_DB, findTenant } from 'src/utils/db-utls';
import { ObjectId } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import {
  IPaginationOptions,
  Pagination,
  // paginate,
} from 'nestjs-typeorm-paginate';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role, RoleType } from 'src/role/entities/role.entity';
import { TENANT_CONNECTION } from 'src/tenant/tenant.module';
import { TenantUser } from 'src/tenant/modules/tenant-users/entities/tenant-user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { delCache, getCache } from 'memcachelibrarybeta';
import { EmailLibrary } from '../utils/emailLibrary';
import { templateCode } from 'src/utils/config';
import { PasswordTokens } from 'src/password-token/entities/password-token.entity';
import { ErrorMessages, SuccessMessages } from 'src/utils/messages';
import { ProfileFieldsService } from 'src/profileFields/profileFields.service';
import { ColumnType } from 'src/profileFields/entities/profileFields.entity';
import { UsersMongoService } from './users.mongo.service';
import { UsersPostgresService } from './users.postgres.service';
import { SettingsService } from 'src/settings/settings.service';
import { JwtService } from '@nestjs/jwt';
import { TenantUsersService } from 'src/tenant/modules/tenant-users/tenant-users.service';
import { Tenant } from 'src/tenant/entities/tenant.entity';
import { GlobalService } from 'src/utils/global.service';

@Injectable()
export class UsersService {
  private userRepository: Repository<User> & MongoRepository<User>;
  private roleRepository: Repository<Role> & MongoRepository<Role>;
  private tenantRepository: Repository<Tenant> & MongoRepository<Tenant>;
  private passwordTokensRepository: Repository<PasswordTokens> &
    MongoRepository<PasswordTokens>;
  tokenLife: number;
  userService: any;

  constructor(
    private tenantUserService: TenantUsersService,
    @Inject(TENANT_CONNECTION) private connection,
    @InjectRepository(TenantUser)
    private tenantUserRepository: Repository<TenantUser>,
    private emailService: EmailLibrary,
    private profileFieldsService: ProfileFieldsService,
    private usersMongoService: UsersMongoService,
    private usersPostgresService: UsersPostgresService,
    private settingsService: SettingsService,
    private jwtService: JwtService,

  ) {

    this.tokenLife = 24; //in hours
    this.userRepository = this.connection.getRepository(User);
    this.roleRepository = this.connection.getRepository(Role);
    this.passwordTokensRepository =
      this.connection.getRepository(PasswordTokens);
  }

  async findOne(_id: any): Promise<User> {
    try {
      const getUserById = async (_id: any) => {
        let user;
        if (isMongoDB) {
          user = await this.usersMongoService.findOne(this.userRepository, _id);
        } else {
          user = await this.usersPostgresService.findOne(
            this.userRepository,
            _id,
          );
        }
        if (!user) {
          throw new NotFoundException(ErrorMessages.USER_NOT_FOUND);
        }
        return user;
      };

      return getCache(_id, getUserById, _id);
    } catch (e) {
      throw e;
    }
  }

  async findOneByEmail(email: string): Promise<User> {
    return this.userRepository.findOne({ where: { email: email } });
  }

  async getSession(request: any, roleId?: string) {

    const user = await this.userRepository.findOne({ where: { _id: request.user._id } });
    let roleDetails = null;

    if (user.roleIds.length === 0) {
      throw new Error("No roles have been assigned to this user")
    } else {

      if (roleId) {
        roleDetails = await this.roleRepository.findOne({ where: { _id: roleId } });
      } else {
        if (user.roleIds.length > 1) {
          roleDetails = await this.roleRepository.find({
            where: {
              _id: In(user.roleIds)
            }
          });
        } else {
          roleDetails = await this.roleRepository.findOne({ where: { _id: user.roleIds[0] } });
        }
      }




      return {
        users: {
          uuid: user._id,
          userAcl: user.acl,
          ...(
            roleId || user.roleIds.length === 1 ? {
              role: roleDetails.roleType,
              roleId: roleDetails._id,
              roleAcl: roleDetails.acl,
              isDefault: roleDetails.areIsDefault
            } : {
              roles: roleDetails
            }
          ),
          featureRestrictions: GlobalService.featuresRestrictions,
          data: {
            displayName: user.firstName + ' ' + user.lastName,
            email: user.email,
          },
        },
      };
    }
  }

  async validate(_id: any): Promise<any> {
    let user;
    if (isMongoDB) {
      user = await this.usersMongoService.findOne(this.userRepository, _id);
    } else {
      user = await this.usersPostgresService.findOne(this.userRepository, _id);
    }
    if (user) {
      const { } = user;
      return {
        user: {
          uuid: user._id,
          role: 'user',
          data: {
            displayName: user.firstName + ' ' + user.lastName,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            acl: user.acl,
            dateOfBirth: user.dateOfBirth,
            gender: user.gender,
            countryCode: user.countryCode,
            phoneNumber: user.phoneNumber,
            country: user.country,
            address: user.address,
            enforcePasswordReset: user.enforcePasswordReset,
          },
        },
      };
    } else {
      throw new NotFoundException(ErrorMessages.USER_NOT_FOUND);
    }
  }

  async adminResetPassword(_id: string) {
    const result = await this.settingsService.findOneSettings('password');

    const DEFAULT_PASSWORD =
      result.settings.defaultPasswordSetByAdmin || 'Welcome123';
    try {
      if (!isObjectIdOrUUID(_id)) {
        throw new BadRequestException(ErrorMessages.INVALID_UUID_FORMAT);
      }

      let user;
      if (isMongoDB) {
        user = await this.usersMongoService.findOne(this.userRepository, _id);
      } else {
        user = await this.usersPostgresService.findOne(
          this.userRepository,
          _id,
        );
      }

      if (!user) {
        throw new NotFoundException(
          ErrorMessages.USER_NOT_FOUND + `with ID ${_id}`,
        );
      }

      const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);
      user.password = hashedPassword;
      user.enforcePasswordReset = 1;
      const result = await this.userRepository.save(user);

      return {
        message: 'Password reseted',
        _id: result._id,
        firstName: result.firstName,
        lastName: result.lastName,
        email: result.email,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new InternalServerErrorException(error.message);
      }
    }
  }

  async searchAndPaginate(
    options: IPaginationOptions,
    search?: string,
    sortBy?: string,
    orderBy?: 'asc' | 'desc',
    roleType?: string,
  ): Promise<Pagination<UserDto>> {
    const page = Number(options.page);
    const limit = Number(options.limit);
    const profileFields = await this.profileFieldsService.findActiveFields();

    if (isMongoDB) {
      return this.usersMongoService.searchUser(
        this.connection,
        profileFields,
        search,
        sortBy,
        orderBy,
        page,
        limit,
        roleType,
      );
    } else {
      return this.usersPostgresService.searchUser(
        this.connection,
        profileFields,
        search,
        sortBy,
        orderBy,
        page,
        limit,
        roleType,
      );
    }
  }

  async forgotPassword(forgotPassword: ForgotPasswordDTO) {
    try {
      const user = await this.findOneByEmail(forgotPassword.email);
      if (!user) {
        throw new NotFoundException(ErrorMessages.USER_NOT_FOUND);
      } else {
        const token = await uuidv4();
        const passwordReset = new PasswordTokens();
        passwordReset.expiresIn = new Date();
        passwordReset.userId = user._id;
        passwordReset.token = token;
        await passwordReset.save();

        const resetPasswordURL = `${process.env.CLIENT_SIDE_URL}/reset-password/${token}`;
        const receiverName = user.firstName + ' ' + user.lastName;
        const ResetPasswordTemplate = templateCode.RESETPASSWORDLINK;
        const data = {
          Template: ResetPasswordTemplate,
          recipientEmail: user.email,
          TemplateData: {
            receiverName: receiverName,
            url: resetPasswordURL,
          },
        };
        const response = await this.emailService.sendEmail(data);
        if (response) {
          return SuccessMessages.EMAIL_SENT_SUCCESSFULLY;
        } else {
          throw new BadRequestException(ErrorMessages.EMAIL_SENDING_ERROR);
        }
      }
    } catch (e) {
      throw e;
    }
  }

  async validateResetPasswordToken(
    token: string,
  ): Promise<{ userId: string; isValid: boolean }> {
    const passwordToken = await this.passwordTokensRepository.findOne({
      where: { token },
    });

    if (!passwordToken) {
      throw new BadRequestException(ErrorMessages.INVALID_TOKEN);
    }

    // Check whether the token is expired
    const isExpired =
      getDurationBetweenDates(
        passwordToken.expiresIn.getTime(),
        new Date().getTime(),
      ) >= this.tokenLife;

    if (isExpired) {
      throw new BadRequestException(ErrorMessages.TOKEN_EXPIRED);
    }

    if (passwordToken.isConsumed) {
      throw new BadRequestException(ErrorMessages.TOKEN_ALREADY_USED);
    }

    return { userId: passwordToken.userId, isValid: true };
  }

  async resetPassword(
    resetPasswordPayload: ResetPasswordDTO,
    endUserToken?: string,
    thirdPartyId?: string,
  ) {
    let userId;

    if (endUserToken || endUserToken !== undefined) {
      const tokenData = await this.validateResetPasswordToken(endUserToken);

      if (!tokenData.isValid) {
        throw new BadRequestException(ErrorMessages.INVALID_TOKEN);
      } else {
        userId = tokenData.userId;
      }
    } else {
      if (!resetPasswordPayload._id || resetPasswordPayload._id === undefined) {
        throw new BadRequestException(ErrorMessages.USER_NOT_FOUND);
      }
      userId = resetPasswordPayload._id;
    }

    let user;
    if (isMongoDB) {
      user = await this.usersMongoService.findOne(this.userRepository, userId);
    } else {
      user = await this.usersPostgresService.findOne(
        this.userRepository,
        userId,
      );
    }

    if (!user) {
      throw new BadRequestException(ErrorMessages.USER_NOT_FOUND);
    }

    //processing password
    const passwordPolicies =
      await this.settingsService.findOneSettings('password'); //need tio chage
    const defaultPassword =
      passwordPolicies.settings.defaultPasswordSetByAdmin || 'Welcome123';

    let password = resetPasswordPayload.password || defaultPassword;

    if (await (bcrypt.compare(resetPasswordPayload?.password, user?.password))) {
      throw new BadRequestException(
        ErrorMessages.DEFAULT_PASSWORD_ERROR_MESSAGE,
      );
    }

    user.password = await bcrypt.hash(password, 10);
    //end of processing password

    console.log(passwordPolicies.settings
      .enforcePasswordResetAfterPasswordResetedByAdmin, "password policies line no 335");


    if (thirdPartyId) {
      if (
        passwordPolicies.settings
          .enforcePasswordResetAfterPasswordResetedByAdmin
      ) {
        user.enforcePasswordReset = 1;
      }
    } else {
      user.enforcePasswordReset = 0;
    }
    await this.userRepository.save(user);

    if (endUserToken) {
      await this.passwordTokensRepository.delete({ userId: userId });
    }

    if (thirdPartyId) {
      if (resetPasswordPayload.shouldSendEmail === true) {
        try {
          const receiverName = user.firstName + ' ' + user.lastName;
          const ResetPasswordTemplate =
            templateCode.ADMIN_PASSWORD_RESET_TEMPLATE;
          const data = {
            Template: ResetPasswordTemplate,
            recipientEmail: user.email,
            TemplateData: {
              receiverName: receiverName,
              resetPassword: password,
            },
          };
          const response = await this.emailService.sendEmail(data);
          if (response) {
            return SuccessMessages.EMAIL_SENT_SUCCESSFULLY;
          } else {
            throw new BadRequestException(ErrorMessages.EMAIL_SENDING_ERROR);
          }
        } catch (e) {
          throw e;
        }
      } else {
        return SuccessMessages.PASSWORD_RESET_SUCCESS;
      }

      //admin has reset your pasword. this is your password
    } else {
      //your [password ] changed successfully
      if (resetPasswordPayload.shouldSendEmail === true) {
        try {
          const receiverName = user.firstName + ' ' + user.lastName;
          const ResetPasswordTemplate =
            templateCode.ENDUSER_PASSWORD_RESET_TEMPLATE;
          const data = {
            Template: ResetPasswordTemplate,
            recipientEmail: user.email,
            TemplateData: {
              receiverName: receiverName,
            },
          };
          const response = await this.emailService.sendEmail(data);
          if (response) {
            return SuccessMessages.EMAIL_SENT_SUCCESSFULLY;
          } else {
            throw new BadRequestException(ErrorMessages.EMAIL_SENDING_ERROR);
          }
        } catch (e) {
          throw e;
        }
      } else {
        return SuccessMessages.PASSWORD_RESET_SUCCESS;
      }
    }
  }

  // async bulkDelete(ids: string[]) {
  //   return this.userRepository.delete(ids);
  // }
}
