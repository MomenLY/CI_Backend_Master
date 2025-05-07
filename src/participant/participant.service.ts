import { Inject, Injectable } from '@nestjs/common';
import { CreateParticipantDto } from './dto/create-participant.dto';
import { UpdateParticipantDto } from './dto/update-participant.dto';
import { FindManyOptions, FindOptionsWhere, MongoRepository, Repository } from 'typeorm';
import { Participant } from './entities/participant.entity';
import { TENANT_CONNECTION } from 'src/tenant/tenant.module';
import { BulkCreateParticipantDto } from './dto/bulk-create-participant.dto';
import { BulkDeleteParticipantDto } from './dto/bulk-delete-participant.dto';
import { SearchParticipantDto } from './dto/search-participant.dto';
import { HallDto } from 'src/hall/dto/create-hall.dto';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class ParticipantService {
  private participantRepository: Repository<Participant> & MongoRepository <Participant>
  
  constructor(
    @Inject(TENANT_CONNECTION) private connection,
  )
  {
    this.participantRepository =this.connection.getRepository(Participant)
  }
  
  async create(createParticipantDto: CreateParticipantDto) {
    const response = await this.participantRepository.save(createParticipantDto);
    return {
      data: response,
      message: "Participant saved successfully"
    }
  }

  async bulkCreate(bulkCreateParticipantDto: BulkCreateParticipantDto[], request:any) {
    try{
      const updatedParticipants = bulkCreateParticipantDto?.['participants'].map(participant => ({
        ...participant,
        epCreatedBy: request.user._id // Add your new field and its value here
      }));
      const hallsToSave = this.participantRepository.create(updatedParticipants);
      const response = await this.participantRepository.save(hallsToSave);
      return {
        data: response,
        message: `${response.length} items saved successfully`,
      };
    } catch (error) {
      console.error('Something went wrong, please try again later.', error);
      throw error;
    }
  }
  async bulkRemove(bulkDeleteParticipantDto: BulkDeleteParticipantDto) {
    try{
      const { ids } = bulkDeleteParticipantDto;
      const deleteResult = await this.participantRepository.delete(ids);
      return {
        deletedCount: deleteResult.affected,
        message: `${deleteResult.affected} items deleted successfully`,
      };
    } catch (error) {
      console.error('Something went wrong, please try again later.', error);
      throw error;
    }
  }

  private paticipants = [];

  async updateBulk(paticipants: UpdateParticipantDto[]): Promise<UpdateParticipantDto[]> {
    try{
      console.log("Participants updated",paticipants);
      let i = 0;
      for (const updateParticipant of paticipants) {
        if (paticipants[i].id === updateParticipant.id) {
          this.paticipants[i] = { ...this.paticipants[i], ...updateParticipant };
        } else {
          throw new Error(`Hall with ID ${updateParticipant.id} not found`);
        }
        i++;
      }
      await this.participantRepository.save(this.paticipants)
      return this.paticipants.filter(paticipant => paticipants.some(p => p.id === paticipant.id));
    } catch (error) {
      console.error('Something went wrong, please try again later.', error);
      throw error;
    }
  }

  async findAll(searchDto: SearchParticipantDto) {
    let totalPage = 0;
    const { 
        keyword,
        epStatus, 
        page = 1, 
        limit = 10, 
        sortColumn = 'createdAt', 
        sortOrder = "ASC"
    } = searchDto;

    const query = this.participantRepository.createQueryBuilder('participant')
        .leftJoinAndSelect('participant.user', 'user');

    if (keyword) {
        //query.orWhere('participant.epUserId ILIKE :epUserId', { epUserId: `%${keyword}%` });
        //query.orWhere('participant.epExpoId ILIKE :epExpoId', { epExpoId: `%${keyword}%` });
        query.orWhere('user.firstName ILIKE :userFirstName', { userFirstName: `%${keyword}%` });
        query.orWhere('user.lastName ILIKE :userLastName', { userLastName: `%${keyword}%` });
        query.orWhere('user.email ILIKE :userEmail', { userEmail: `%${keyword}%` });
    }

    if (epStatus !== undefined) {
        query.andWhere('participant.epStatus = :epStatus', { epStatus });
    }
    
    const totalCount = await query.getCount();

    const validSortOrder: "ASC" | "DESC" = sortOrder.toUpperCase() === 'ASC' || sortOrder.toUpperCase() === 'DESC'
        ? sortOrder.toUpperCase() as "ASC" | "DESC"
        : 'ASC';
    
    console.log("Order: " ,sortOrder)
    query.skip((page - 1) * limit);
    query.take(limit);
    query.orderBy(`user.${sortColumn}`, validSortOrder)

    const [result, total] = await query.getManyAndCount();

    // const [sql, parameters] = query.getQueryAndParameters();
    // console.log('Generated SQL:', sql);
    // console.log('Parameters:', parameters);
    return {
        data: result,
        total,
        totalPage : Math.ceil(totalCount/limit)
    };
}

}