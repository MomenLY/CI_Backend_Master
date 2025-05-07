import { Inject, Injectable } from '@nestjs/common';
import { CreateHallDto, HallDto } from './dto/create-hall.dto';
import { UpdateHallDto } from './dto/update-hall.dto';
import { Hall } from './entities/hall.entity';
import { FindManyOptions, FindOptionsWhere, ILike, Like, MongoRepository, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { response } from 'express';
import { BulkCreateHallDto } from './dto/bulk-create-hall.dto';
import { BulkDeleteHallDto } from './dto/bulk-delete-hall.dto';
import { UpdateHallsDto } from './dto/bulk-update-hall.dto';
import { validate as isUUID } from 'uuid';
import { TENANT_CONNECTION } from 'src/tenant/tenant.module';
import { IPaginationOptions, Pagination } from 'nestjs-typeorm-paginate';
import { SearchHallDto } from './dto/search-hall.dto';
import { Schedule } from 'src/schedule/entities/schedule.entity';


@Injectable()
export class HallService {
  private hallRepository: Repository<Hall> & MongoRepository <Hall>
  private scheduleRepository: Repository<Schedule> & MongoRepository <Schedule>
  
  constructor(
    @Inject(TENANT_CONNECTION) private connection,
  )
  {
    this.hallRepository =this.connection.getRepository(Hall)
    this.scheduleRepository =this.connection.getRepository(Schedule)
  }
  
  // async create(createHallDto: CreateHallDto) {
  //   const response = await this.hallRepository.save(createHallDto);
  //   return {
  //     data: response,
  //     message: "Hall saved successfully"
  //   }
  // }

  async bulkCreate(bulkCreateHallDto: BulkCreateHallDto[], request:any) {
    try{
      const updatedHalls = bulkCreateHallDto?.['halls'].map(hall => ({
        ...hall,
        hallCreatedBy: request.user._id // Add your new field and its value here
      }));
      
      const hallsToSave = await this.hallRepository.create(updatedHalls);
      const response = await this.hallRepository.save(hallsToSave);
      return {
        data: response,
        message: `${response.length} items saved successfully`,
      };
    } catch (error) {
      console.error('Something went wrong, please try again later.', error);
      throw error;
    }
  }
  async bulkRemove(bulkDeleteHallDto: BulkDeleteHallDto) {
    try{
      const { ids } = bulkDeleteHallDto;
      const deleteResult = await this.hallRepository.delete(ids);
      return {
        deletedCount: deleteResult.affected,
        message: `${deleteResult.affected} items deleted successfully`,
      };
    } catch (error) {
      console.error('Something went wrong, please try again later.', error);
      throw error;
    }
  }

  private halls = [];

  async updateBulk(halls: UpdateHallDto[], request:any): Promise<UpdateHallDto[]> {
    try{

      let i = 0;
      for (const updateHall of halls) {
        if (halls[i].id === updateHall.id) {
          this.halls[i] = { ...this.halls[i], ...updateHall };
        } else {
          throw new Error(`Hall with ID ${updateHall.id} not found`);
        }
        i++;
      }
      await this.hallRepository.save(this.halls)
      return this.halls.filter(hall => halls.some(h => h.id === hall.id));
    } catch (error) {
      console.error('Something went wrong, please try again later.', error);
      throw error;
    }
  }

  
  async findAll(searchHallDto: SearchHallDto) {
    const { keyword, page = 1, limit = 10, sortColumn = 'createdAt', sortOrder = 'ASC' } = searchHallDto;
    
    const skip = (page - 1) * limit;
  
    const where: FindOptionsWhere<Hall>[]= [];
  
    if (keyword) {
      where.push(
        { hallName: ILike(`%${keyword}%`) },
        { hallDescription: ILike(`%${keyword}%`) }
      );
    }
  
    const order: FindManyOptions<Hall>['order'] = {
      [sortColumn]: sortOrder.toUpperCase(),
    };

    const totalCount = await this.hallRepository.count({ where });
  
    const [result, total] = await this.hallRepository.findAndCount({
      where,
      take: limit,
      skip,
      order,
    });
  
    const hallsWithScheduleCount = await Promise.all(
      result.map(async (hall) => {
        const scheduleCount = await this.scheduleRepository.count({ where: { schHallId: hall.id } });
        return new HallDto(hall, scheduleCount);
      })
    );
  
    return {
      data: hallsWithScheduleCount,
      total,
      totalPages : Math.ceil( totalCount / limit )
    };
  }
  

  findOne(id: string): Promise<Hall> {
    return this.hallRepository.findOneBy({ id });
  }
}

