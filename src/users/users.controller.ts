import {
  Controller,
  Get,
  Post,
  Body,
  Request,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  Patch,
  Param,
  Delete,
  BadRequestException,
  UseGuards,
  ParseArrayPipe,
  Put,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import {
  CreateUserDto,
  DeleteUsersDTO,
  ForgotPasswordDTO,
  ResetPasswordDTO,
  UserDto,
} from './dto/create-user.dto';
import { CreateUser, Public } from 'src/auth/auth.decorator';
import { AppAbility } from 'src/casl/casl-ability.factory/casl-ability.factory';
import { Pagination, IPaginationOptions } from 'nestjs-typeorm-paginate';
import { ObjectId } from 'mongodb';
import { BulkUpdateUserDto, UpdateUserDto } from './dto/update-user.dto';
import { PoliciesGuard } from 'src/casl/policies.guard';
import { CheckPolicies } from 'src/casl/casl.decorator';
import { UsersHelper } from '../usersHelper/users.helper';
import { RoleType } from 'src/role/entities/role.entity';
import { ErrorMessages } from 'src/utils/messages';


@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly usersHelper: UsersHelper,
  ) { }

  @Get('profile')
  getProfile(@Request() request) {
    if (process.env.DB_TYPE === 'postgres') {
      console.log(request.user._id, 'in profile,,,,,,');
      return this.usersService.validate(request.user._id);
    } else {
      const objectId = new ObjectId(request.user._id);
      return this.usersService.validate(objectId);
    }
  }

  @Get('session')
  getSessions(@Request() request, @Query('roleId') roleId?: string) {
    return this.usersService.getSession(request, roleId);
  }

  @CreateUser()
  @Post()
  async create(@Request() req, @Body() createUserDto: CreateUserDto) {

    return this.usersHelper
      .bulkCreate(req.user, [createUserDto])
      .then((result) => {
        if (result.insertCount === 0) {
          throw new BadRequestException(result.message);
        }
        return { ...result.created[0], message: result.message };
      });
  }

  @CreateUser()
  @Post('bulk')
  createBulkUsers(
    @Request() req,
    @Body(new ParseArrayPipe({ items: CreateUserDto }))
    createBulkDto: CreateUserDto[],
  ) {
    return this.usersHelper.bulkCreate(req.user, createBulkDto);
  }

  @Patch(':id')
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersHelper.bulkUpdate(req.user, [
      { ...updateUserDto, _id: id },
    ]);
  }

  @Patch('admin/reset/:id')
  adminResetPassword(@Param('id') id: string) {
    return this.usersService.adminResetPassword(id);
  }

  @Put('bulk')
  updateBulkUsers(
    @Request() req,
    @Body(new ParseArrayPipe({ items: BulkUpdateUserDto }))
    updateBulkDto: BulkUpdateUserDto[],
  ) {
    return this.usersHelper.bulkUpdate(req.user, updateBulkDto);
  }

  @Get(':id')
  getSingleUser(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Delete(':id')
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can('deleteUser', 'users'))
  deleteUser(@Request() req, @Param('id') id: string) {
    return this.usersHelper.bulkDelete(req.user, [id]);
  }

  @Get()
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit = 50,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('orderBy') orderBy?: 'asc' | 'desc',
    @Query('roleType') roleType?: string,
  ): Promise<Pagination<UserDto>> {
    limit = limit > 100 ? 100 : limit;
    const options: IPaginationOptions = {
      page,
      limit,
    };

    let users: Pagination<UserDto>;

    users = await this.usersService.searchAndPaginate(
      options,
      search,
      sortBy,
      orderBy,
      roleType,
    );
    return users;
  }
  @Public()
  @Post('password/forgot')
  forgotPassword(@Body() forgotPasswordDTO: ForgotPasswordDTO) {
    return this.usersService.forgotPassword(forgotPasswordDTO);
  }

  @Public()
  @Post('validate-reset-password-token/:token')
  async validateResetPasswordToken(@Param('token') token: string) {
    return this.usersService.validateResetPasswordToken(token);
  }

  @Public()
  @Post('reset/password/:token')
  resetPasswordWithToken(
    @Body() resetPassword: ResetPasswordDTO,
    @Param('token') token?: string,
    @Request() req?,
  ) {
    return this.usersService.resetPassword(resetPassword, token, undefined);
  }

  @Post('reset/password')
  resetPasswordByWithoutToken(
    @Body() resetPassword: ResetPasswordDTO,
    @Request() req,
  ) {
    let thirdParty = req.user._id;

    if (req.user.role === RoleType.ENDUSER) {
      if (resetPassword._id && resetPassword._id !== req.user._id) {
        throw new BadRequestException(ErrorMessages.OPERATION_NOT_PERMITTED);
      }
      resetPassword._id = req.user._id;
      thirdParty = null;
    }

    if (req.user.role === RoleType.ADMIN) {
      if (!resetPassword._id) {
        resetPassword._id = req.user._id;
        thirdParty = null;
      }
    }

    if (!resetPassword._id) {
      throw new BadRequestException(ErrorMessages.OPERATION_NOT_PERMITTED);
    }
    return this.usersService.resetPassword(
      resetPassword,
      undefined,
      thirdParty,
    );
  }


  @Delete()
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can('deleteUser', 'users'))
  deleteUsers(@Request() req, @Body() deleteUsersDto: DeleteUsersDTO) {
    return this.usersHelper.bulkDelete(req.user, deleteUsersDto.ids);
  }
}
