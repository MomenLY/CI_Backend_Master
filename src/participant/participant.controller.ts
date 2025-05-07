import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Request } from '@nestjs/common';
import { ParticipantService } from './participant.service';
import { CreateParticipantDto, ParticipantDto } from './dto/create-participant.dto';
import { UpdateParticipantDto } from './dto/update-participant.dto';
import { PoliciesGuard } from 'src/casl/policies.guard';
import { Public } from 'src/auth/auth.decorator';
import { CheckPolicies } from 'src/casl/casl.decorator';
import { AppAbility } from 'src/casl/casl-ability.factory/casl-ability.factory';
import { SearchParticipantDto } from './dto/search-participant.dto';
import { HallDto } from 'src/hall/dto/create-hall.dto';
import { UpdateParticipantsDto } from './dto/bulk-update-participant.dto';
import { BulkCreateParticipantDto } from './dto/bulk-create-participant.dto';
import { BulkDeleteParticipantDto } from './dto/bulk-delete-participant.dto';

@Controller('participant')
export class ParticipantController {
  constructor(private readonly participantService: ParticipantService) {}

  @Public()
  @Get()
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can('viewHalls', 'halls'))
  async findAll(@Query() searchParticipantDto: SearchParticipantDto): Promise<{ data: ParticipantDto[]; total: number }> {
    return await this.participantService.findAll(searchParticipantDto);
  }
  
  @Patch('bulk-update')
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can('editParticipant', 'participants'))
  async updateBulk(@Body() updateParticipantsDto: UpdateParticipantsDto) {
    const halls = await this.participantService.updateBulk(updateParticipantsDto.participants);
    return {
      message: 'Participant updated successfully',
      halls,
    };
  }

  @Post('bulk-create')
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can('addParticipant', 'participants'))
  bulkCreate(@Body() bulkCreateParticipantDto: BulkCreateParticipantDto[], @Request() req) {
    return this.participantService.bulkCreate(bulkCreateParticipantDto, req);
  }
  @Delete('bulk-delete')
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can('deleteParticipant', 'participants'))
  bulkRemove(@Body() bulkDeleteParticipantDto: BulkDeleteParticipantDto) {
    return this.participantService.bulkRemove(bulkDeleteParticipantDto);
  }

}