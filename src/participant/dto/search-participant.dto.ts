import { IsBoolean, IsOptional, IsString, IsUUID, IsJSON } from 'class-validator';
import { PaginationDto } from './pagination.dto';

export class SearchParticipantDto extends PaginationDto {
    @IsString()
    @IsOptional()
    keyword?: string;

    // @IsUUID()
    // @IsOptional()
    // epUserId?: string;

    // @IsUUID()
    // @IsOptional()
    // epExpoId?: string;

    // @IsString()
    // @IsOptional()
    // userFirstName?: string;

    // @IsString()
    // @IsOptional()
    // userLastName?: string;

    // @IsString()
    // @IsOptional()
    // userEmail?: string;

    @IsBoolean()
    @IsOptional()
    epStatus?: boolean;

    @IsString()
    @IsOptional()
    sortColumn?: string;

    @IsString()
    @IsOptional()
    sortOrder?: string;
}
