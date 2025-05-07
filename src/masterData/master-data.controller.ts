import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { MasterDataService } from './master-data.service';
import { CreateMasterDataDto } from './dto/create-master-data.dto';
import { UpdateMasterDataDto } from './dto/update-master-data.dto';
import { Public } from 'src/auth/auth.decorator';

@Controller('master-data')
export class MasterDataController {
  constructor(private readonly masterDataService: MasterDataService) {}

  @Post()
  create(@Body() createMasterDataDto: CreateMasterDataDto) {
    return this.masterDataService.create(createMasterDataDto);
  }

  @Public()
  @Get()
  findAll() {
    return this.masterDataService.findAll();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.masterDataService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateMasterDataDto: UpdateMasterDataDto,
  ) {
    return this.masterDataService.update(id, updateMasterDataDto);
  }

  @Patch()
  batchUpdate(@Body() updateMasterDataDto: UpdateMasterDataDto[]) {
    return this.masterDataService.batchUpdate(updateMasterDataDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.masterDataService.remove(id);
  }
}
