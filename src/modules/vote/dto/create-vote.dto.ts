import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEmail,
  IsNumber,
  MaxLength,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateVoteDto {
  // @ApiProperty({
  //   example: 'VOTE001',
  //   description: 'Unique identifier for the vote',
  // })
  // @IsNotEmpty()
  // @IsString()
  // @MaxLength(50)
  // id: string;

  @ApiProperty({
    example: 'voter@example.com',
    description: 'Email of the voter',
  })
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(255)
  voterEmail: string;

  @ApiProperty({
    example: 'SURVEY001',
    description: 'ID of the survey for which the vote is being cast',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  surveyId: string;

  @ApiProperty({
    example: 'PARTY001',
    description: 'ID of the party being voted for',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  partyId: string;

  @ApiPropertyOptional({
    example: 'Male',
    description: 'Gender of the voter',
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  gender?: string;

  @ApiPropertyOptional({
    example: 25,
    description: 'Age of the voter',
  })
  @IsOptional()
  @IsNumber()
  @Min(18)
  @Max(120)
  age?: number;

  @ApiPropertyOptional({
    example: 'New York',
    description: 'Location of the voter',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  location?: string;

  @ApiPropertyOptional({
    example: '2026-03-16T10:30:00Z',
    description: 'When the vote was cast (optional, defaults to current time)',
  })
  @IsOptional()
  votedAt?: Date;
}
 