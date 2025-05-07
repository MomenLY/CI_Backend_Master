import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, FindManyOptions, FindOptionsWhere, Like, MongoRepository, Repository } from 'typeorm';
import { Schedule } from './entities/schedule.entity';
import { TENANT_CONNECTION } from 'src/tenant/tenant.module';
import { IPaginationOptions, Pagination } from 'nestjs-typeorm-paginate';
import { CreateScheduleDto, ScheduleDto } from './dto/create-schedule.dto';
import { TenantUser } from 'src/tenant/modules/tenant-users/entities/tenant-user.entity';
import { ProfileFieldsService } from 'src/profileFields/profileFields.service';
import { UsersPostgresService } from 'src/users/users.postgres.service';
import { SearchScheduleDto } from './dto/search-schedule.dto';
import { Hall } from 'src/hall/entities/hall.entity';

@Injectable()
export class ScheduleService {
  private scheduleRepository: Repository<Schedule> & MongoRepository <Schedule>
  private hallRepository: Repository<Hall> & MongoRepository <Hall>

  constructor(
    @Inject(TENANT_CONNECTION) private connection,
  )
  {
    this.scheduleRepository = this.connection.getRepository(Schedule)
    this.hallRepository =this.connection.getRepository(Hall)
  }
  
  async findAll(searchScheduleDto: SearchScheduleDto): Promise<{ data: ScheduleDto[]; total: number }> {
    const { schName, schStartDateTime, schEndDateTime, schHallId, schExpoId, page, limit, sortColumn = 'schCreatedAt', sortOrder = 'ASC' } = searchScheduleDto;

    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<Schedule> = {};

    if (schName) {
      where.schName = Like(`%${schName}%`);
    }

    // if (schStartDateTime) {
    //   where.andWhere('schedule.schStartDateTime >= :schStartDateTime', { schStartDateTime });
    // }

    // if (schEndDateTime) {
    //   where.andWhere('schedule.schEndDateTime <= :schEndDateTime', { schEndDateTime });
    // }

    // if (schHallId) {
    //   query.andWhere('schedule.schHallId = :schHallId', { schHallId });
    // }

    // if (schExpoId) {
    //   query.andWhere('schedule.schExpoId = :schExpoId', { schExpoId });
    // }

    const order: FindManyOptions<Schedule>['order'] = {
      [sortColumn]: sortOrder.toUpperCase(),
    };

    const [result, total] = await this.scheduleRepository.findAndCount({
      where,
      take: limit,
      skip,
      order,
    });
    return {
      data: result.map(schedule => new ScheduleDto(schedule)),
      total,
    };
  }

  findOne(_id: string): Promise<Schedule> {
    return this.scheduleRepository.findOneBy({ _id });
  }

  create(schedule: Schedule, request : any): Promise<Schedule> {
    schedule.schCreatedBy = request.user._id;
    return this.scheduleRepository.save(schedule);
  }

  async update(id: string, schedule: Schedule): Promise<Schedule> {
    await this.scheduleRepository.update(id, schedule);
    return this.scheduleRepository.findOneBy({ _id: id });
  }

  async remove(id: string): Promise<DeleteResult> {
    const response = await this.scheduleRepository.delete(id);
    return response;
  }

}
