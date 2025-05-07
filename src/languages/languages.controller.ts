import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  BadRequestException,
  Delete,
} from '@nestjs/common';
import { LanguagesService } from './languages.service';
import { UpdateLanguageDto } from './dto/update-language.dto';
import { BypassAuth } from 'src/auth/auth.decorator';
import { DeleteLanguageDto } from './dto/delete-language.dto';

@Controller('languages')
export class LanguagesController {
  constructor(private readonly languagesService: LanguagesService) {}

  @Get(':lang')
  findAll(
    @Param('lang') lang: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(100), ParseIntPipe) limit: number,
    @Query('search') search?: string,
  ) {
    return this.languagesService.findAll(lang, page, limit, search);
  }

  @BypassAuth()
  @Get('json/:lang')
  findOne(@Param('lang') lang: string) {
    return this.languagesService.findByLanguage(lang);
  }

  @Patch()
  async update(@Body() updateLanguageDto: UpdateLanguageDto) {
    const dataValues = Object.values(updateLanguageDto.data).filter(data => data && data.trim());
    const dataKeys = Object.keys(updateLanguageDto.data).filter(data => data && data.trim());
    if(dataKeys.length !== dataValues.length) {
      throw new BadRequestException('Language definitions cannot be empty.')
    }
    return this.languagesService.update(updateLanguageDto);
  }

  @Delete()
  async deleteDefinitions(@Body() deleteLanguageDto: DeleteLanguageDto) {
    return this.languagesService.delete(deleteLanguageDto);
  }
}
