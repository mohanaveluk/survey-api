import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsBoolean,
  IsNumber,
  IsEnum,
  IsDateString,
  MaxLength,
  IsArray,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SurveyStatus } from '../entity/survey.entity';

export class CreateSurveyDto {
  @ApiProperty({
    example: 'SURVEY001',
    description: 'Unique identifier for the survey',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  id: string;

  @ApiProperty({
    example: 'Presidential Election 2026',
    description: 'Name of the survey',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({
    example: 'Survey for the upcoming presidential election',
    description: 'Detailed description of the survey',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: 'admin@system.com',
    description: 'Email or ID of the user who created the survey',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  createdBy?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Whether the survey is active',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    example: 0,
    description: 'Total number of votes in the survey',
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  totalVotes?: number;

  @ApiPropertyOptional({
    enum: SurveyStatus,
    example: SurveyStatus.DRAFT,
    description: 'Current status of the survey',
    default: SurveyStatus.DRAFT,
  })
  @IsOptional()
  @IsEnum(SurveyStatus)
  status?: SurveyStatus;

  @ApiPropertyOptional({
    example: '2026-04-01T00:00:00.000Z',
    description: 'Survey start date and time',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    example: '2026-04-30T23:59:59.000Z',
    description: 'Survey end date and time',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Whether the survey allows anonymous voting',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isAnonymous?: boolean;

  @ApiPropertyOptional({
    type: [String],
    example: ['party1', 'party2', 'party3'],
    description: 'Array of party IDs to associate with this survey',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  partyIds?: string[];  
}
