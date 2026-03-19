import { IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSurveyPartyDto {
  @ApiProperty({
    example: 'SURVEY001',
    description: 'ID of the survey to associate with the party',
  })
  @IsNotEmpty()
  @IsString()
  surveyId: string;

  @ApiProperty({
    example: 'PARTY001',
    description: 'ID of the party to associate with the survey',
  })
  @IsNotEmpty()
  @IsString()
  partyId: string;
}

export class BulkCreateSurveyPartyDto {
  @ApiProperty({
    example: 'SURVEY001',
    description: 'ID of the survey',
  })
  @IsNotEmpty()
  @IsString()
  surveyId: string;

  @ApiProperty({
    example: ['PARTY001', 'PARTY002', 'PARTY003'],
    description: 'Array of party IDs to associate with the survey',
    type: [String],
  })
  @IsNotEmpty()
  @IsString({ each: true })
  partyIds: string[];
}
