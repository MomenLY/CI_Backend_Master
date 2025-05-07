import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Request,
} from '@nestjs/common';
import { SettingsService } from './settings.service';
import { CreateSettingDto } from './dto/create-setting.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { Public } from 'src/auth/auth.decorator';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Public()
  @Post()
  create(@Request() request, @Body() createSettingDto: CreateSettingDto) {
    console.log(request, "from settings")
    return this.settingsService.create(createSettingDto);
  }

  @Public()
  @Get()
  findAll() {
    return this.settingsService.findAll();
  }

  @Public()
  @Get('single')
  findOneSettings(@Query('key') key: string) {
    return this.settingsService.findOneSettings(key);
  }

  @Patch('update')
  update(
    @Request() request,
    @Query('key') key: string,
    @Body() updateSettingDto: UpdateSettingDto,
  ) {
    return this.settingsService.update(key, updateSettingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.settingsService.remove(+id);
  }

  @Get('get')
  findSettings(@Query('key') key: string) {
    return this.settingsService.findSettings(key);
  }
}
