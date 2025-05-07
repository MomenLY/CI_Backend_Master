import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TENANT_CONNECTION } from 'src/tenant/tenant.module';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { EmailLibrary } from '../utils/emailLibrary';
import { MongoRepository, Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Role, RoleType } from 'src/role/entities/role.entity';
import { IDENTIFY_TENANT_FROM_PRIMARY_DB } from '../utils/db-utls';
import { isMongoDB, splitArray } from '../utils/helper';
import * as bcrypt from '@node-rs/bcrypt';
import { ErrorMessages, SuccessMessages } from '../utils/messages';
import { templateCode } from 'src/utils/config';
import { BulkUpdateUserDto } from '../users/dto/update-user.dto';
import { CaslAbilityFactory } from 'src/casl/casl-ability.factory/casl-ability.factory';
import { delCache } from 'memcachelibrarybeta';
import {
  isDateString,
  isEmail,
  isMilitaryTime,
  isURL,
  validate,
} from 'class-validator';
import { RequestUser, UserId } from '../users/dto/request-user.dto';
import { ProfileFieldsService } from 'src/profileFields/profileFields.service';
import { UsersMongoHelper } from './users.mongo.helper';
import { UsersPostgresHelper } from './users.postgres.helper';
import { TenantUsersService } from 'src/tenant/modules/tenant-users/tenant-users.service';
import { SettingsService } from 'src/settings/settings.service';
@Injectable()
export class UsersHelper {
  private userRepository: Repository<User> & MongoRepository<User>;
  private roleRepository: Repository<Role> & MongoRepository<Role>;

  constructor(
    @Inject(TENANT_CONNECTION) private connection,
    private emailService: EmailLibrary,
    private caslAbilityFactory: CaslAbilityFactory,
    private readonly profileFieldsService: ProfileFieldsService,
    private readonly settingsService: SettingsService,
    private readonly usersMongoHelper: UsersMongoHelper,
    private readonly usersPostgresHelper: UsersPostgresHelper,
    private readonly tenantUsersService: TenantUsersService,
  ) {
    this.userRepository = this.connection.getRepository(User);
    this.roleRepository = this.connection.getRepository(Role);
  }

  async bulkValidate(reqUser, users, ClassName) {
    const promiseArr = users.map((user) => validate(new ClassName(user)));
    if (reqUser) {
      promiseArr.push(validate(new RequestUser(reqUser)));
    }
    const errors = await Promise.all(promiseArr);
    const errs = [];
    for (const error of errors) {
      if (error.length > 0) {
        for (const err of error) {
          errs.push(...Object.values(err.constraints));
        }
      }
    }
    if (errs.length > 0) {
      throw new BadRequestException(errs);
    }
  }

  async bulkDeleteValidate(reqUser, ids) {
    const promiseArr = ids.map((id) => validate(new UserId(id)));
    if (reqUser) {
      promiseArr.push(validate(new RequestUser(reqUser)));
    }
    const errors = await Promise.all(promiseArr);
    const errs = [];
    for (const error of errors) {
      if (error.length > 0) {
        for (const err of error) {
          errs.push(...Object.values(err.constraints));
        }
      }
    }
    if (errs.length > 0) {
      throw new BadRequestException(errs);
    }
  }

  async profileFieldValidate(users, create) {
    const profileFields = await this.profileFieldsService.findActiveFields();
    const profileFieldsToSaveObject = {};
    for (const user of users) {
      const userKeys = Object.keys(user);
      const userProfileFields = profileFields.filter(
        (key) => userKeys.indexOf(key.pFColumName) > -1,
      );
      for (const userProfileField of userProfileFields) {
        switch (userProfileField.pFType) {
          case 'date':
          // if(!isDate(user[userProfileField.pFColumName])) {
          //   throw new BadRequestException(`${userProfileField.pFColumName} field should be a date.`)
          // }
          // break;
          case 'datetime':
            if (!isDateString(user[userProfileField.pFColumName])) {
              throw new BadRequestException(
                `${userProfileField.pFColumName} field should be a date.`,
              );
            }
            break;
          case 'time':
            if (!isMilitaryTime(user[userProfileField.pFColumName])) {
              throw new BadRequestException(
                `${userProfileField.pFColumName} field should be a time.`,
              );
            }
            break;
          default:
        }
        if (userProfileField?.pFValidation?.type) {
          switch (userProfileField?.pFValidation?.type) {
            case 'text':
              if (typeof user[userProfileField.pFColumName] !== 'string') {
                throw new BadRequestException(
                  `${userProfileField.pFColumName} field should be a string.`,
                );
              }
              break;
            case 'number':
              if (isNaN(user[userProfileField.pFColumName])) {
                throw new BadRequestException(
                  `${userProfileField.pFColumName} field should be a number.`,
                );
              }
              break;
            case 'email':
              if (!isEmail(user[userProfileField.pFColumName])) {
                throw new BadRequestException(
                  `${userProfileField.pFColumName} field should be an email.`,
                );
              }
              break;
            case 'url':
              if (!isURL(user[userProfileField.pFColumName])) {
                throw new BadRequestException(
                  `${userProfileField.pFColumName} field should be an url.`,
                );
              }
              break;
            case 'custom':
              if (
                !new RegExp(
                  userProfileField.pFValidation.regexPattern,
                  'i',
                ).test(user[userProfileField.pFColumName])
              ) {
                throw new BadRequestException(
                  `${userProfileField.pFColumName} field should match ${userProfileField.pFValidation.regexPattern}.`,
                );
              }
              break;
            default:
          }
        }
        const key = create ? user.email : user._id;
        if (!profileFieldsToSaveObject[key]) {
          profileFieldsToSaveObject[key] = {};
        }
        profileFieldsToSaveObject[key][userProfileField.pFColumName] =
          user[userProfileField.pFColumName];
      }
    }
    return profileFieldsToSaveObject;
  }

  async bulkCreate(reqUser: any, users: CreateUserDto[]) {
    await this.bulkValidate(reqUser, users, CreateUserDto);
    const profileFieldsToSaveObject = await this.profileFieldValidate(
      users,
      true,
    );
    const userRole = reqUser?.role || RoleType.ENDUSER;
    let hasCreatePermission = false;

    const usersObj = {};
    let submittedRoleIds = [];

    // remove duplicates
    for (const user of users) {
      if (!usersObj[user.email]) {
        usersObj[user.email] = { ...user };
        if (Array.isArray(user.roleIds)) {
          submittedRoleIds = [...submittedRoleIds, ...user.roleIds];
        }
      }
    }
    const emailIds = Object.keys(usersObj);
    users = Object.values(usersObj);

    // To optimize mongodb find operation.
    const emailChunks = splitArray(emailIds, 50);
    let existingEmails = [];
    let disallowedEmails = [];

    for (const emailsArr of emailChunks) {
      let usersArr = [];
      if (isMongoDB) {
        usersArr = await this.usersMongoHelper.findUsersByEmails(
          this.userRepository,
          emailsArr,
        );
      } else {
        usersArr = await this.usersPostgresHelper.findUsersByEmails(
          this.userRepository,
          emailsArr,
        );
      }
      if (usersArr.length > 0) {
        existingEmails = [...existingEmails, ...usersArr.map((u) => u.email)];
      }
    }

    users = users.filter((u) => existingEmails.indexOf(u.email) === -1);

    if (reqUser && userRole === RoleType.ADMIN) {
      const ability = this.caslAbilityFactory.createForUser(reqUser);
      hasCreatePermission = ability.can('addUser', 'users');
    }

    const role = await this.roleRepository.findOne({
      where: {
        roleType:
          process.env.B2B === 'true' ? RoleType.ADMIN : RoleType.ENDUSER,
      },
    });
    if (role) {
      const roleId = role._id;
      let usersToSave = [];

      // To optimize mongodb find operation.
      const roleChunks = splitArray(submittedRoleIds, 50);

      let roles = [];

      for (const roleChunk of roleChunks) {
        let rolesArr = [];
        if (isMongoDB) {
          rolesArr = await this.usersMongoHelper.findRolesByIds(
            this.roleRepository,
            roleChunk,
          );
        } else {
          rolesArr = await this.usersPostgresHelper.findRolesByIds(
            this.roleRepository,
            roleChunk,
          );
        }
        if (rolesArr.length > 0) {
          roles = [...roles, ...rolesArr];
        }
      }

      for (const userData of users) {
        let {
          password,
          roleIds = [],
          email,
          firstName,
          lastName,
          dateOfBirth,
          gender,
          countryCode,
          phoneNumber,
          country,
          address,
          enforcePasswordReset,
          userImage,
        } = userData;

        const userRoles = roles.filter(
          (role) => roleIds.indexOf(role._id) > -1,
        );
        roleIds = userRoles.map((role) => role._id);

        if (
          !hasCreatePermission &&
          userRoles.filter((role) => role.roleType === RoleType.ADMIN).length >
            0
        ) {
          disallowedEmails = [...disallowedEmails, email];
          continue;
        }

        const userToSave = {
          password,
          roleIds,
          email,
          firstName,
          lastName,
          dateOfBirth,
          gender,
          countryCode,
          phoneNumber,
          country,
          address,
          enforcePasswordReset,
          profileFields: {},
          userImage,  
        };

        if (profileFieldsToSaveObject[userData.email]) {
          userToSave.profileFields = profileFieldsToSaveObject[userData.email];
        }

        const saltRounds = 10;
        const hash = await bcrypt.hash(password, saltRounds);
        userToSave.password = hash;
        if (userToSave.roleIds.length === 0) {
          userToSave.roleIds.push(roleId);
        }

        const passwordPolicies =
          await this.settingsService.findOneSettings('password');

        userToSave.enforcePasswordReset =
          reqUser && passwordPolicies.settings.resetPasswordAfterFirstLogin
            ? 1
            : 0;
        usersToSave = [...usersToSave, userToSave];
      }

      const newUsers = await this.userRepository.save(usersToSave, {
        chunk: 1000,
      });
      if (newUsers.length > 0) {
        const newProfileFieldsToSave = [];
        const tenantUsersToSave = [];
        for (const newUser of newUsers) {
          if (profileFieldsToSaveObject[newUser.email]) {
            newProfileFieldsToSave.push({
              userId: newUser._id,
              ...profileFieldsToSaveObject[newUser.email],
            });
          }
          tenantUsersToSave.push({
            name: newUser.firstName + ' ' + newUser.lastName,
            email: newUser.email,
            phone: '',
            tenantIdentifier: this.connection.name,
            userId: newUser._id,
          });
        }
        if (IDENTIFY_TENANT_FROM_PRIMARY_DB) {
          await this.tenantUsersService.saveTenantUsers(tenantUsersToSave);
        }
        if (newProfileFieldsToSave.length > 0) {
          if (isMongoDB) {
            await this.usersMongoHelper.insertProfileFields(
              this.connection,
              newProfileFieldsToSave,
            );
          } else {
            await this.usersPostgresHelper.insertProfileFields(
              this.connection,
              newProfileFieldsToSave,
            );
          }
        }
      }
      const userRegistrationTemplate = templateCode.USERACCOUNTCREATION;

      const createdUsers = [];
      const emailFailedUsers = [];

      for (const newUser of newUsers) {
        const { _id, firstName, lastName, email } = newUser;
        const userData = users.find((u) => u.email === email);

        createdUsers.push({ _id, firstName, lastName, email });
        const shouldSendRegistrationEmail =
          !('shouldSendEmail' in userData) ||
          userData.shouldSendEmail !== false;
        if (shouldSendRegistrationEmail) {
          const data = {
            Template: userRegistrationTemplate,
            recipientEmail: email,
            TemplateData: {
              receiverName: firstName + ' ' + lastName,
              url: `${process.env.CLIENT_SIDE_URL}/sign-in`,
            },
          };

          const response = await this.emailService.sendEmail(data);
          if (response['error'] === true) {
            emailFailedUsers.push(email);
          }
        }
      }

      const message = [];

      if (existingEmails.length > 0) {
        message.push(
          ErrorMessages.EMAIL_ALREADY_TAKEN.replace(
            '{emailIds}',
            existingEmails.join(),
          ),
        );
      }

      if (disallowedEmails.length > 0) {
        message.push(
          ErrorMessages.BULK_CREATE_NOTALLOWED_ERROR.replace(
            '{emailIds}',
            disallowedEmails.join(),
          ),
        );
      }

      if (emailFailedUsers.length > 0) {
        message.push(
          ErrorMessages.BULK_EMAIL_SENDING_ERROR.replace(
            '{emailIds}',
            emailFailedUsers.join(),
          ),
        );
      }

      return {
        insertCount: createdUsers.length,
        created: createdUsers,
        failed: [...existingEmails, ...disallowedEmails],
        message:
          message.length === 0
            ? [SuccessMessages.BULK_USER_CREATE_SUCCESS]
            : message,
      };
    } else {
      throw new NotFoundException(ErrorMessages.ENDUSER_NOT_FOUND);
    }
  }

  // async bulkUpdate(reqUser: any, users: BulkUpdateUserDto[]) {
  //   await this.bulkValidate(reqUser, users, BulkUpdateUserDto);
  //   const profileFieldsToSaveObject = await this.profileFieldValidate(users, false);
  //   const userRole = reqUser?.role || RoleType.ENDUSER;
  //   const userId = reqUser?._id;
  //   let hasUpdatePermission = false;

  //   const usersObj = {};

  //   console.log(users,"in bulkUpdate");

  //   // remove duplicates
  //   for (const user of users) {
  //     if (!usersObj[user._id]) {
  //       usersObj[user._id] = { ...user };
  //     }
  //   }
  //   users = Object.values(usersObj);

  //   let disallowedIds = [];
  //   const failedIds = [];

  //   if (reqUser && userRole === RoleType.ADMIN) {
  //     const ability = this.caslAbilityFactory.createForUser(reqUser);
  //     hasUpdatePermission = ability.can('editUser', 'users');
  //   }

  //   let updateCount = 0;

  //   const tenantUserArray = [];
  //   const updatedIds = [];

  //   const queryRunner = this.connection.createQueryRunner();
  //   await queryRunner.connect();
  //   await queryRunner.startTransaction();
  //   try {
  //     for (const user of users) {
  //       let {
  //         _id,
  //         firstName,
  //         lastName,
  //         email,
  //         roleIds = [],
  //         dateOfBirth,
  //         gender,
  //         countryCode,
  //         phoneNumber,
  //         country,
  //         address,
  //         status
  //       } = user;

  //       let roles = [];

  //       if (roleIds.length > 0) {
  //         if (isMongoDB) {
  //           roles = await this.usersMongoHelper.findRolesByIds(queryRunner.manager.getRepository(Role), roleIds);
  //         } else {
  //           roles = await this.usersPostgresHelper.findRolesByIds(queryRunner.manager.getRepository(Role), roleIds);
  //         }
  //       }

  //       console.log(roles, "roles");
  //       roleIds = roles.map((role) => role._id);

  //       if (
  //         !hasUpdatePermission &&
  //         (_id !== userId ||
  //           (_id === userId &&
  //             roles.filter((role) => role.roleType === RoleType.ADMIN).length >
  //             0))
  //       ) {

  //         disallowedIds = [...disallowedIds, _id];
  //         continue;
  //       }

  //       let userData;
  //       if (isMongoDB) {
  //         userData = await this.usersMongoHelper.findUserById(queryRunner.manager.getRepository(User), _id)
  //       } else {
  //         userData = await this.usersPostgresHelper.findUserById(queryRunner.manager.getRepository(User), _id)
  //       }

  //       if (userData) {
  //         if (email && email !== userData.email) {
  //           const isEmailTaken = await queryRunner.manager
  //             .getRepository(User)
  //             .findOne({
  //               where: { email },
  //             });
  //           if (isEmailTaken) {
  //             failedIds.push(_id);
  //             continue;
  //           }
  //         }

  //         if (firstName) {
  //           userData.firstName = firstName;
  //         }
  //         if (lastName) {
  //           userData.lastName = lastName;
  //         }
  //         if (email) {
  //           userData.email = email;
  //         }
  //         if (roleIds.length > 0) {
  //           for(let rolem of roles){
  //             console.log(rolem, "role");
  //             userData.roleIds.push(rolem._id);
  //           }
  //         }

  //         console.log()
  //         if (dateOfBirth) {
  //           userData.dateOfBirth = dateOfBirth;
  //         }
  //         if (gender) {
  //           userData.gender = gender;
  //         }
  //         if (countryCode) {
  //           userData.countryCode = countryCode;
  //         }
  //         if (phoneNumber) {
  //           userData.phoneNumber = phoneNumber;
  //         }
  //         if (country) {
  //           userData.country = country;
  //         }
  //         if (address) {
  //           userData.address = address;
  //         }
  //         if (status) {
  //           userData.status = status
  //         }
  //         if (profileFieldsToSaveObject[_id]) {
  //           const existingFields = userData.profileFields || {};
  //           userData.profileFields = { ...existingFields, ...profileFieldsToSaveObject[_id] };
  //         }

  //         const tenantUser: any = { userId: _id };
  //         if (firstName && lastName) {
  //           tenantUser.name = `${firstName} ${lastName}`;
  //         }
  //         if (email) {
  //           tenantUser.email = email;
  //         }

  //         if (Object.keys(tenantUser).length > 1) {
  //           tenantUserArray.push({ ...tenantUser });
  //         }
  //         console.log(userData, "userData");
  //         await queryRunner.manager.getRepository(User).save(userData);
  //         if (profileFieldsToSaveObject[_id]) {
  //           if (isMongoDB) {
  //             await this.usersMongoHelper.updateProfileField(queryRunner, _id, profileFieldsToSaveObject);
  //           } else {
  //             await this.usersPostgresHelper.updateProfileField(queryRunner, _id, profileFieldsToSaveObject);
  //           }
  //         }
  //         updateCount++;
  //         updatedIds.push(_id);
  //       } else {
  //         disallowedIds = [...disallowedIds, _id];
  //       }
  //     }

  //     await queryRunner.commitTransaction();
  //   } catch (e) {
  //     await queryRunner.rollbackTransaction();
  //     throw e;
  //   } finally {
  //     await queryRunner.release();
  //   }

  //   if (IDENTIFY_TENANT_FROM_PRIMARY_DB && tenantUserArray.length > 0) {
  //     await this.tenantUsersService.updateTenantUsers(tenantUserArray);
  //   }

  //   if (updatedIds.length > 0) {
  //     try {
  //       await Promise.all(updatedIds.map((id) => delCache(id)));
  //     } catch (e) { }
  //   }

  //   const message = [];

  //   if (failedIds.length > 0) {
  //     message.push(
  //       ErrorMessages.EMAIL_ALREADY_TAKEN_ID.replace('{ids}', failedIds.join()),
  //     );
  //   }

  //   if (disallowedIds.length > 0) {
  //     message.push(
  //       ErrorMessages.BULK_UPDATE_NOTALLOWED_ERROR.replace(
  //         '{ids}',
  //         disallowedIds.join(),
  //       ),
  //     );
  //   }

  //   return {
  //     updateCount,
  //     failed: [...disallowedIds, ...failedIds],
  //     message:
  //       message.length === 0
  //         ? [SuccessMessages.BULK_USER_UPDATE_SUCCESS]
  //         : message,
  //   };
  // }

  async bulkUpdate(reqUser: any, users: BulkUpdateUserDto[]) {
    console.log(users[0].roleIds, 'userrr----------------------');

    await this.bulkValidate(reqUser, users, BulkUpdateUserDto);
    const profileFieldsToSaveObject = await this.profileFieldValidate(
      users,
      false,
    );
    const userRole = reqUser?.role || RoleType.ENDUSER;
    const userId = reqUser?._id;
    let hasUpdatePermission = false;

    const usersObj = {};
    for (const user of users) {
      if (!usersObj[user._id]) {
        usersObj[user._id] = { ...user };
      }
    }
    users = Object.values(usersObj);

    let disallowedIds = [];
    const failedIds = [];

    if (reqUser && userRole === RoleType.ADMIN) {
      const ability = this.caslAbilityFactory.createForUser(reqUser);
      hasUpdatePermission = ability.can('editUser', 'users');
    }

    let updateCount = 0;

    const tenantUserArray = [];
    const updatedIds = [];

    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      for (const user of users) {
        let {
          _id,
          firstName,
          lastName,
          email,
          roleIds = [],
          dateOfBirth,
          gender,
          countryCode,
          phoneNumber,
          country,
          address,
          status,
        } = user;

        let roles = [];

        if (roleIds.length > 0) {
          if (isMongoDB) {
            roles = await this.usersMongoHelper.findRolesByIds(
              queryRunner.manager.getRepository(Role),
              roleIds,
            );
          } else {
            roles = await this.usersPostgresHelper.findRolesByIds(
              queryRunner.manager.getRepository(Role),
              roleIds,
            );
          }
        }
        roleIds = roles.map((role) => role._id);
        if (
          !hasUpdatePermission &&
          (_id !== userId ||
            (_id === userId &&
              roles.filter((role) => role.roleType === RoleType.ADMIN).length >
                0))
        ) {
          disallowedIds = [...disallowedIds, _id];
          continue;
        }

        console.log(disallowedIds, 'disallowedIdss---------------------------');
        let userData;
        if (isMongoDB) {
          userData = await this.usersMongoHelper.findUserById(
            queryRunner.manager.getRepository(User),
            _id,
          );
        } else {
          userData = await this.usersPostgresHelper.findUserById(
            queryRunner.manager.getRepository(User),
            _id,
          );
        }

        if (userData) {
          if (email && email !== userData.email) {
            const isEmailTaken = await queryRunner.manager
              .getRepository(User)
              .findOne({
                where: { email },
              });
            if (isEmailTaken) {
              failedIds.push(_id);
              continue;
            }
          }

          if (firstName) {
            userData.firstName = firstName;
          }
          if (lastName) {
            userData.lastName = lastName;
          }
          if (email) {
            userData.email = email;
          }

          userData.roleIds = [];
          if (roleIds.length > 0) {
            for (let _roleId of roleIds) {
              userData.roleIds.push(_roleId);
            }
          }

          if (dateOfBirth) {
            console.log('inside if dob');

            userData.dateOfBirth = dateOfBirth;
          }
          if (gender) {
            userData.gender = gender;
          }
          if (countryCode) {
            userData.countryCode = countryCode;
          }
          if (phoneNumber) {
            userData.phoneNumber = phoneNumber;
          }
          if (country) {
            userData.country = country;
          }
          if (address) {
            userData.address = address;
          }
          if (status) {
            userData.status = status;
          }
          if (profileFieldsToSaveObject[_id]) {
            const existingFields = userData.profileFields || {};
            userData.profileFields = {
              ...existingFields,
              ...profileFieldsToSaveObject[_id],
            };
          }

          const tenantUser: any = { userId: _id };
          if (firstName && lastName) {
            tenantUser.name = `${firstName} ${lastName}`;
          }
          if (email) {
            tenantUser.email = email;
          }

          if (Object.keys(tenantUser).length > 1) {
            tenantUserArray.push({ ...tenantUser });
          }
          await queryRunner.manager.getRepository(User).save(userData);
          if (profileFieldsToSaveObject[_id]) {
            if (isMongoDB) {
              await this.usersMongoHelper.updateProfileField(
                queryRunner,
                _id,
                profileFieldsToSaveObject,
              );
            } else {
              await this.usersPostgresHelper.updateProfileField(
                queryRunner,
                _id,
                profileFieldsToSaveObject,
              );
            }
          }
          updateCount++;
          updatedIds.push(_id);
        } else {
          disallowedIds = [...disallowedIds, _id];
        }
      }

      await queryRunner.commitTransaction();
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw e;
    } finally {
      await queryRunner.release();
    }

    if (IDENTIFY_TENANT_FROM_PRIMARY_DB && tenantUserArray.length > 0) {
      await this.tenantUsersService.updateTenantUsers(tenantUserArray);
    }

    if (updatedIds.length > 0) {
      try {
        await Promise.all(updatedIds.map((id) => delCache(id)));
      } catch (e) {}
    }

    const message = [];

    if (failedIds.length > 0) {
      message.push(
        ErrorMessages.EMAIL_ALREADY_TAKEN_ID.replace('{ids}', failedIds.join()),
      );
    }

    if (disallowedIds.length > 0) {
      message.push(
        ErrorMessages.BULK_UPDATE_NOTALLOWED_ERROR.replace(
          '{ids}',
          disallowedIds.join(),
        ),
      );
    }

    return {
      updateCount,
      failed: [...disallowedIds, ...failedIds],
      message:
        message.length === 0
          ? [SuccessMessages.BULK_USER_UPDATE_SUCCESS]
          : message,
    };
  }

  async bulkUpdate_(reqUser: any, users: BulkUpdateUserDto[]) {
    console.log(users, 'userssss');
    await this.bulkValidate(reqUser, users, BulkUpdateUserDto);
    const profileFieldsToSaveObject = await this.profileFieldValidate(
      users,
      false,
    );
    const userRole = reqUser?.role || RoleType.ENDUSER;
    const userId = reqUser?._id;
    let hasUpdatePermission = false;

    const usersObj = {};

    // remove duplicates
    for (const user of users) {
      if (!usersObj[user._id]) {
        usersObj[user._id] = { ...user };
      }
    }
    users = Object.values(usersObj);

    let disallowedIds = [];
    const failedIds = [];

    if (reqUser && userRole === RoleType.ADMIN) {
      const ability = this.caslAbilityFactory.createForUser(reqUser);
      hasUpdatePermission = ability.can('editUser', 'users');
    }

    let updateCount = 0;

    const tenantUserArray = [];
    const updatedIds = [];

    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      for (const user of users) {
        let {
          _id,
          firstName,
          lastName,
          email,
          roleIds = [],
          dateOfBirth,
          gender,
          countryCode,
          phoneNumber,
          country,
          address,
          status,
        } = user;

        let roles = [];

        if (roleIds.length > 0) {
          if (isMongoDB) {
            roles = await this.usersMongoHelper.findRolesByIds(
              queryRunner.manager.getRepository(Role),
              roleIds,
            );
          } else {
            roles = await this.usersPostgresHelper.findRolesByIds(
              queryRunner.manager.getRepository(Role),
              roleIds,
            );
          }
        }

        console.log(roles, 'roles');
        roleIds = roles.map((role) => role._id);

        if (
          !hasUpdatePermission &&
          (_id !== userId ||
            (_id === userId &&
              roles.filter((role) => role.roleType === RoleType.ADMIN).length >
                0))
        ) {
          disallowedIds = [...disallowedIds, _id];
          continue;
        }

        console.log(disallowedIds, 'iddddddd');
        let userData;
        if (isMongoDB) {
          userData = await this.usersMongoHelper.findUserById(
            queryRunner.manager.getRepository(User),
            _id,
          );
        } else {
          userData = await this.usersPostgresHelper.findUserById(
            queryRunner.manager.getRepository(User),
            _id,
          );
        }

        if (userData) {
          if (email && email !== userData.email) {
            const isEmailTaken = await queryRunner.manager
              .getRepository(User)
              .findOne({
                where: { email },
              });
            if (isEmailTaken) {
              failedIds.push(_id);
              continue;
            }
          }

          if (firstName) {
            userData.firstName = firstName;
          }
          if (lastName) {
            userData.lastName = lastName;
          }
          if (email) {
            userData.email = email;
          }

          userData.roleIds = [];
          if (roleIds.length > 0) {
            for (let rolem of roles) {
              console.log(rolem, 'role');
              userData.roleIds.push(rolem._id);
            }
          }

          console.log();
          if (dateOfBirth) {
            console.log('inside if dob');

            userData.dateOfBirth = dateOfBirth;
          }
          if (gender) {
            userData.gender = gender;
          }
          if (countryCode) {
            userData.countryCode = countryCode;
          }
          if (phoneNumber) {
            userData.phoneNumber = phoneNumber;
          }
          if (country) {
            userData.country = country;
          }
          if (address) {
            userData.address = address;
          }
          if (status) {
            userData.status = status;
          }
          if (profileFieldsToSaveObject[_id]) {
            const existingFields = userData.profileFields || {};
            userData.profileFields = {
              ...existingFields,
              ...profileFieldsToSaveObject[_id],
            };
          }

          const tenantUser: any = { userId: _id };
          if (firstName && lastName) {
            tenantUser.name = `${firstName} ${lastName}`;
          }
          if (email) {
            tenantUser.email = email;
          }

          if (Object.keys(tenantUser).length > 1) {
            tenantUserArray.push({ ...tenantUser });
          }
          console.log(userData, 'userData');
          await queryRunner.manager.getRepository(User).save(userData);
          if (profileFieldsToSaveObject[_id]) {
            if (isMongoDB) {
              await this.usersMongoHelper.updateProfileField(
                queryRunner,
                _id,
                profileFieldsToSaveObject,
              );
            } else {
              await this.usersPostgresHelper.updateProfileField(
                queryRunner,
                _id,
                profileFieldsToSaveObject,
              );
            }
          }
          updateCount++;
          updatedIds.push(_id);
        } else {
          disallowedIds = [...disallowedIds, _id];
        }
      }

      await queryRunner.commitTransaction();
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw e;
    } finally {
      await queryRunner.release();
    }

    if (IDENTIFY_TENANT_FROM_PRIMARY_DB && tenantUserArray.length > 0) {
      await this.tenantUsersService.updateTenantUsers(tenantUserArray);
    }

    if (updatedIds.length > 0) {
      try {
        await Promise.all(updatedIds.map((id) => delCache(id)));
      } catch (e) {}
    }

    const message = [];

    if (failedIds.length > 0) {
      message.push(
        ErrorMessages.EMAIL_ALREADY_TAKEN_ID.replace('{ids}', failedIds.join()),
      );
    }

    if (disallowedIds.length > 0) {
      message.push(
        ErrorMessages.BULK_UPDATE_NOTALLOWED_ERROR.replace(
          '{ids}',
          disallowedIds.join(),
        ),
      );
    }

    return {
      updateCount,
      failed: [...disallowedIds, ...failedIds],
      message:
        message.length === 0
          ? [SuccessMessages.BULK_USER_UPDATE_SUCCESS]
          : message,
    };
  }

  async bulkDelete(reqUser: any, ids: string[]) {
    if (!reqUser) {
      throw new ForbiddenException();
    }
    await this.bulkDeleteValidate(reqUser, ids);
    const ability = this.caslAbilityFactory.createForUser(reqUser);
    if (!ability.can('deleteUser', 'users')) {
      throw new ForbiddenException();
    }

    ids = [...new Set(ids)];
    // To optimize mongodb find operation.
    const idChunks = splitArray(ids, 50);

    const result = [];
    for (const idsArr of idChunks) {
      if (IDENTIFY_TENANT_FROM_PRIMARY_DB) {
        await this.tenantUsersService.deleteTenantUsers(idsArr);
      }
      const res = await this.userRepository.delete(idsArr);
      result.push(res);
    }

    const deleteCount = result.reduce((accumulator, currentValue) => {
      const value = currentValue.affected
        ? currentValue.affected
        : currentValue.deletedCount
          ? currentValue.deletedCount
          : 0;
      return accumulator + value;
    }, 0);

    return {
      deleteCount,
      message: SuccessMessages.BULK_USER_DELETE_SUCCESS,
    };
  }
}
