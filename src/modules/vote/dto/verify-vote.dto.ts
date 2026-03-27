import { IsNotEmpty, IsString, IsEmail, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyVoteDto {
  @ApiProperty({
    example: 'unique-temp-vote-id',
    description: 'Temporary Unique identifier for the vote'
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  tempVoteId: string;

  @ApiProperty({
    example: 'voter@example.com',
    description: 'Email of the voter'
  })
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(255)
  voterEmail: string;

  @ApiProperty({
    example: 'SURVEY001',
    description: 'ID of the survey'
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  surveyId: string;

  @ApiProperty({
    example: '123456',
    description: '6-digit verification code'
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(6)
  verificationCode: string;
}

export class TempVoteResponseDto {
  @ApiProperty({
    example: 'unique-temp-vote-id',
    description: 'Temporary Unique identifier for the vote'
  })
  tempVoteId: string;

  @ApiProperty({
    example: '123456',
    description: '6-digit verification code'
  })
  verificationCode: string;

  @ApiProperty({
    example: 'voter@example.com',
    description: 'Voter email'
  })
  voterEmail: string;

  @ApiProperty({
    example: 'SURVEY001',
    description: 'Survey ID'
  })
  surveyId: string;

  @ApiProperty({
    example: 'PARTY001',
    description: 'Party ID'
  })
  partyId: string;

  @ApiProperty({
    example: '2026-03-23T10:00:00Z',
    description: 'Expiry time for the verification code'
  })
  expiresAt: Date;

  @ApiProperty({
    example: "A 6-digit verification code has been generated. Please enter it to confirm your vote",
    description: "Instruction for the next step"
  })
  message: string
}

export class ResendCodeDto {
    @ApiProperty({
        example: 'SURVEY001',
        description: 'Survey ID'
    })
    surveyId: string;

    @ApiProperty({
        example: 'voter@example.com',
        description: 'Voter email'
    })
    voterEmail: string;
}