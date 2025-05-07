import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, ILike, MongoRepository, Repository } from 'typeorm';
import { Schedule } from 'src/schedule/entities/schedule.entity'; // Adjust the import path as necessary
import { CheckAvailabilityDto } from './dto/check-availability.dto';
import { TENANT_CONNECTION } from 'src/tenant/tenant.module';
import { Hall } from 'src/hall/entities/hall.entity';

@Injectable()
export class HallAvailabilityService {
  private scheduleRepository: Repository<Schedule> & MongoRepository <Schedule>
  private hallRepository: Repository<Hall> & MongoRepository <Hall>

  
  constructor(
    @Inject(TENANT_CONNECTION) private connection,
  )
  {
    this.scheduleRepository =this.connection.getRepository(Schedule)
    this.hallRepository =this.connection.getRepository(Hall)
  }

  async checkAvailability(dto: CheckAvailabilityDto): Promise<any> {
    const { expoId, hallId, startDateTime, endDateTime } = dto;

    const queryBuilder = this.scheduleRepository.createQueryBuilder('schedule');

    if (expoId) {
      queryBuilder.andWhere('schedule.schExpoId = :expoId', { expoId });
    }

    if (hallId) {
      queryBuilder.andWhere('schedule.schHallId = :hallId', { hallId });
    }

    if (startDateTime && endDateTime) {
      queryBuilder.andWhere(
        '(schedule.schStartDateTime < :endDateTime AND schedule.schEndDateTime > :startDateTime)',
        { startDateTime, endDateTime }
      );
    }

    // Print the generated query and parameters
    // const [query, parameters] = queryBuilder.getQueryAndParameters();
    // console.log('Generated Query:', query);
    // console.log('Query Parameters:', parameters);

    const [result, count] = await queryBuilder.getManyAndCount();
    return count ;
  }
}
