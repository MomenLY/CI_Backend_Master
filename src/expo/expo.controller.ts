import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Request } from '@nestjs/common';
import { ExpoService } from './expo.service';
import { CreateExpoDto, ExpoDto } from './dto/create-expo.dto';
import { UpdateExpoDto } from './dto/update-expo.dto';
import { BulkCreateExpoDto } from './dto/bulk-create-expo.dto';
import { BulkDeleteExpoDto } from './dto/bulk-delete-expo.dto';
import { UpdateExposDto } from './dto/bulk-update-expo.dto';
import { Public } from 'src/auth/auth.decorator';
import { PoliciesGuard } from 'src/casl/policies.guard';
import { AppAbility } from 'src/casl/casl-ability.factory/casl-ability.factory';
import { CheckPolicies } from 'src/casl/casl.decorator';
import { SearchExpoDto } from './dto/search-expo.dto';

@Controller('expo')
export class ExpoController {
  constructor(private readonly expoService: ExpoService) {}

  @Public()
  @Get()
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can('viewExpos', 'expo'))
  async findAll(@Query() searchHallDto: SearchExpoDto): Promise<{ data: ExpoDto[]; total: number }> {
    return await this.expoService.findAll(searchHallDto);
  }

  @Get(':id')
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can('viewExpos', 'expo'))
  findOne(@Param('id') id: string, @Request() req) {
    return this.expoService.findOne(id, req);
  }
  @Patch('bulk-update')
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can('editExpo', 'expo'))
  async updateBulk(@Body() updateExposDto: UpdateExposDto) {
    const expos = await this.expoService.updateBulk(updateExposDto.expos);
    return {
      message: 'Expos updated successfully',
      expos,
    };
  }

  @Post('bulk-create')
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can('addExpo', 'expo'))
  bulkCreate(@Body() bulkCreateExpoDto: BulkCreateExpoDto[], @Request() req) {
    return this.expoService.bulkCreate(bulkCreateExpoDto, req);
  }
  @Delete('bulk-delete')
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can('deleteExpo', 'expo'))
  bulkRemove(@Body() bulkDeleteExpoDto: BulkDeleteExpoDto) {
    console.log("here comes")
    return this.expoService.bulkRemove(bulkDeleteExpoDto);
  }

  
}
