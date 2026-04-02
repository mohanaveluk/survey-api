import { PartialType, OmitType, ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { CreateSurveyDto } from './create-survey.dto';
import { SurveyStatus } from '../entity/survey.entity';

import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateSurveyDto extends PartialType(
  OmitType(CreateSurveyDto, ['id'] as const)
) {}


export class PublishSurveyDto {
  @ApiPropertyOptional({
    enum: SurveyStatus,
    example: SurveyStatus.PUBLISHED,
    description: 'Status to update the survey to (PUBLISHED or CLOSED)',
  })
  @IsOptional()
  @IsEnum(SurveyStatus)
  status?: SurveyStatus;

  @ApiProperty({
    type: String,
    example: 'https://survey.surveyUrl',
    description: 'The URL where the survey can be accessed',
  })
  surveyUrl: string;

  @ApiProperty({
    type: String,
    example: 'https://short.url/survey',
    description: 'A shortened URL for the survey',
  })
  shortUrl: string;
}




export class UpdatePartyIdsDto {
  @ApiProperty({
    type: [String],
    example: ['party1', 'party2', 'party3'],
    description: 'Array of party IDs to associate with this survey',
  })
  @IsArray()
  @IsString({ each: true })
  partyIds: string[];
}