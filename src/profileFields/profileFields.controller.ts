import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseArrayPipe,
} from '@nestjs/common';
import { ProfileFieldsService } from './profileFields.service';
import { CreateProfileFieldDto } from './dto/createProfileField.dto';
import { UpdateProfileFieldDto, BatchDeleteDto } from './dto/updateProfileField.dto';

@Controller('profile-fields')
export class ProfileFieldsController {
  constructor(private readonly profileFieldsService: ProfileFieldsService) {}

  @Post()
  create(@Body(new ParseArrayPipe({ items: CreateProfileFieldDto })) createProfileFieldDto: CreateProfileFieldDto[]) {
    return this.profileFieldsService.create(createProfileFieldDto);
  }

  @Get()
  findAll() {
    return this.profileFieldsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.profileFieldsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateProfileFieldDto: UpdateProfileFieldDto,
  ) {
    return this.profileFieldsService.update(id, updateProfileFieldDto);
  }

  @Patch()
  batchUpdate(@Body(new ParseArrayPipe({ items: UpdateProfileFieldDto })) updateProfileFieldDto: UpdateProfileFieldDto[]) {
    return this.profileFieldsService.batchUpdate(updateProfileFieldDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.profileFieldsService.remove([id]);
  }

  @Delete()
  async batchDelete(@Body() batchDeleteDto: BatchDeleteDto) {
    return this.profileFieldsService.remove(batchDeleteDto.ids);
  }
}
