import { Controller, Get, Post, Body, Patch, Param, Delete, DefaultValuePipe, ParseIntPipe, Query, Request } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { CreateScheduleDto, ScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { SearchScheduleDto } from './dto/search-schedule.dto';
import { Schedule } from './entities/schedule.entity';
import { IPaginationOptions, Pagination } from 'nestjs-typeorm-paginate';
import { HallAvailabilityService } from '../libs/hall-availability/hall-availability.service';
import { CheckAvailabilityDto } from '../libs/hall-availability/dto/check-availability.dto';

@Controller('schedule')
export class ScheduleController {
  constructor(
    private readonly scheduleService: ScheduleService,
    private readonly hallAvailabilityService: HallAvailabilityService
  ) {}

  @Get()
  async findAll(@Query() searchScheduleDto: SearchScheduleDto): Promise<{ data: ScheduleDto[]; total: number }> {
    return await this.scheduleService.findAll(searchScheduleDto);
  }

  @Get('check')
  async check(@Query() dto: CheckAvailabilityDto): Promise<{ available: boolean }> {
    const available = await this.hallAvailabilityService.checkAvailability(dto);
    return { available };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.scheduleService.findOne(id);
  }

  @Post()
  create(@Body() createScheduleDto: CreateScheduleDto, @Request() req) {
    return this.scheduleService.create(createScheduleDto as Schedule, req);
  }

  @Patch(':id')
  update(@Param('id') _id: string, @Body() updateScheduleDto: UpdateScheduleDto) {
    return this.scheduleService.update(_id, updateScheduleDto as Schedule);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.scheduleService.remove(id);
  }
}
