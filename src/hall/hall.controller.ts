import { Controller, Get, Post, Body, Patch, Param, Delete, Query, DefaultValuePipe, ParseIntPipe, UseGuards, Request } from '@nestjs/common';
import { HallService } from './hall.service';
import { CreateHallDto, HallDto } from './dto/create-hall.dto';
import { UpdateHallDto } from './dto/update-hall.dto';
import { BulkCreateHallDto } from './dto/bulk-create-hall.dto';
import { BulkDeleteHallDto } from './dto/bulk-delete-hall.dto';
import { UpdateHallsDto } from './dto/bulk-update-hall.dto';
import { Public } from 'src/auth/auth.decorator';
import { IPaginationOptions, Pagination } from 'nestjs-typeorm-paginate';
import { SearchHallDto } from './dto/search-hall.dto';
import { PoliciesGuard } from 'src/casl/policies.guard';
import { CheckPolicies } from 'src/casl/casl.decorator';
import { AppAbility } from 'src/casl/casl-ability.factory/casl-ability.factory';

@Controller('hall')
export class HallController {
  constructor(private readonly hallService: HallService) {}

  @Public()
  @Get()
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can('viewHalls', 'halls'))
  async findAll(@Query() searchHallDto: SearchHallDto): Promise<{ data: HallDto[]; total: number }> {
    return await this.hallService.findAll(searchHallDto);
  }
  
  @Patch('bulk-update')
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can('editHall', 'halls'))
  async updateBulk(@Body() updateHallsDto: UpdateHallsDto, @Request() req ) {
    const halls = await this.hallService.updateBulk(updateHallsDto.halls, req);
    return {
      message: 'Halls updated successfully',
      halls,
    };
  }

  @Post('bulk-create')
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can('addHall', 'halls'))
  bulkCreate(@Body() bulkCreateHallDto: BulkCreateHallDto[], @Request() req ) {
    console.log(req, "req")
    return this.hallService.bulkCreate(bulkCreateHallDto, req);
  }
  @Delete('bulk-delete')
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can('deleteHall', 'halls'))
  bulkRemove(@Body() bulkDeleteHallDto: BulkDeleteHallDto) {
    return this.hallService.bulkRemove(bulkDeleteHallDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.hallService.findOne(id);
  }
  
}
