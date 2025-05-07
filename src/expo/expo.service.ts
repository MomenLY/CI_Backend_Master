import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateExpoDto, ExpoDto } from './dto/create-expo.dto';
import { UpdateExpoDto } from './dto/update-expo.dto';
import { Expo } from './entities/expo.entity';
import { Between, FindManyOptions, FindOptionsWhere, ILike, LessThanOrEqual, Like, MongoRepository, MoreThan, MoreThanOrEqual, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { response } from 'express';
import { BulkCreateExpoDto } from './dto/bulk-create-expo.dto';
import { BulkDeleteExpoDto } from './dto/bulk-delete-expo.dto';
import { UpdateExposDto } from './dto/bulk-update-expo.dto';
import { validate as isUUID } from 'uuid';
import { TENANT_CONNECTION } from 'src/tenant/tenant.module';
import { SearchExpoDto } from './dto/search-expo.dto';
import { Schedule } from '../schedule/entities/schedule.entity';
import { User } from '../users/entities/user.entity';


@Injectable()
export class ExpoService {
  private expoRepository: Repository<Expo> & MongoRepository <Expo>
  private scheduleRepository: Repository<Schedule> & MongoRepository <Schedule>
  
  constructor(
    @Inject(TENANT_CONNECTION) private connection,
  )
  {
    this.expoRepository =this.connection.getRepository(Expo)
  }
  
  async create(createExpoDto: CreateExpoDto) {
    const response = await this.expoRepository.save(createExpoDto);
    return {
      data: response,
      message: "Expo saved successfully"
    }
  }
  async findAll(searchExpoDto: SearchExpoDto) {
    const { expDescription, expName, expStartDate, expEndDate, expType, page = 1, limit = 10, sortColumn = 'createdAt', sortOrder = 'ASC' } = searchExpoDto;
    
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<Expo> = {};

    if (expDescription) {
      where.expDescription = ILike(`%${expDescription}%`);
    }

    if (expName) {
      where.expName = ILike(`%${expName}%`);
    }

    // if (expStartDate && expEndDate) {
    //   where.expStartDate = Between(new Date(expStartDate), new Date(expEndDate));
    // } else if (expStartDate) {
    //   where.expStartDate = MoreThanOrEqual(new Date(expStartDate));
    // } else if (expEndDate) {
    //   where.expEndDate = LessThanOrEqual(new Date(expEndDate));
    // }

    //console.log(new Date(expStartDate),"where");
    const order: FindManyOptions<Expo>['order'] = {
      [sortColumn]: sortOrder.toUpperCase(),
    };

    const [result, total] = await this.expoRepository.findAndCount({
      where,
      take: limit,
      skip,
      order,
    });

    return {
      data: result.map(expo => new ExpoDto(expo)),
      total,
    };
  }

  async findOne(id: string, request: any): Promise<{ expo: any; speakers: any; schedules : any }> {
    try{
      
      if(request.user.role === 'admin'){
        let expoQuery = `select * from public.expo where id = '${id}'`;
        const [expos] = await Promise.all([
          this.connection.query(expoQuery)
        ]);
        const expo = expos[0],speakers=[],schedules=[];
        return { expo, speakers, schedules };
      }else{
        //get speakers details
        let query = `
                  select distinct u."_id",u."firstName",u."lastName", u."userImage" from public.schedule s 
                  join unnest(s."ssUserId") as uid on true
                  join public.user as u on u._id =uid
                  join public.expo as expo on  expo.id=s."schExpoId"`;
        let conditions = [];
        if ( id ) {
          conditions.push(`
            (
              expo.id='${id}'
            )
          `);
        }
        if (conditions.length > 0) {
          query += ` WHERE ${conditions.join(' AND ')}`;
        }
        
        //get expo details
        let expoQuery = `select * from public.expo where id = '${id}'`;

        //get schedule details
        let scheduleQuery = ` SELECT
                                  h."hallName",
                                  s."schName",
                                  s."schStartDateTime",
                                  s."schEndDateTime",
                                  s.id, 
                                  string_agg(u."firstName" || ' ' || u."lastName", ', ') AS speakers
                              FROM 
                                  public.schedule s
                              JOIN 
                                  public.user u ON u._id = ANY(s."ssUserId")
                              JOIN
                                  public.hall h on s."schHallId" = h.id
                              WHERE
                                  s."schExpoId"='${id}'
                              GROUP BY 
                                  s.id,h."hallName"`;
        


        const [speakers, expos, schedules] = await Promise.all([
            this.connection.query(query),
            this.connection.query(expoQuery),
            this.connection.query(scheduleQuery)

        ]);

        const expo = expos[0];

        return { expo, speakers, schedules };
      }
    } catch (error) {
      console.error('Something went wrong, please try again later.', error);
      throw error;
    }
  }

  async bulkCreate(bulkCreateExpoDto: BulkCreateExpoDto[], request: any){
    try{
      const updatedExpos = bulkCreateExpoDto?.['expos'].map(expo => ({
        ...expo,
        expCreatedBy: request.user._id // Add your new field and its value here
      }));
      const exposToSave = this.expoRepository.create(updatedExpos);
      const response = await this.expoRepository.save(exposToSave);
      return {
        data: response,
        message: `${response.length} items saved successfully`,
      };
    } catch (error) {
      console.error('Something went wrong, please try again later.', error);
      throw error;
    }
  }
  async bulkRemove(bulkDeleteExpoDto: BulkDeleteExpoDto) {
    try{
      const { ids } = bulkDeleteExpoDto;
      console.log(ids);
      const deleteResult = await this.expoRepository.delete(ids);
      return {
        deletedCount: deleteResult.affected,
        message: `${deleteResult.affected} items deleted successfully`,
      };
    } catch (error) {
      console.error('Something went wrong, please try again later.', error);
      throw error;
    }
  }

  private expos = [];

  async updateBulk(expos: UpdateExpoDto[]): Promise<UpdateExpoDto[]> {
    try{
      console.log("Expos updated",expos);
      let i = 0;
      for (const updateExpo of expos) {
        if (expos[i].id === updateExpo.id) {
          this.expos[i] = { ...this.expos[i], ...updateExpo };
        } else {
          throw new Error(`Expo with ID ${updateExpo.id} not found`);
        }
        i++;
      }
      await this.expoRepository.save(this.expos)
      return this.expos.filter(expo => expos.some(h => h.id === expo.id));
    } catch (error) {
      console.error('Something went wrong, please try again later.', error);
      throw error;
    }
  }
}
