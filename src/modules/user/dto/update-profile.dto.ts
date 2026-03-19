import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, Matches, MinLength } from 'class-validator';

export class UpdateProfileDto {
  @ApiProperty({
    example: 'John',
    description: 'User first name',
  })
  @IsOptional()
  @MinLength(2)
  first_name?: string;

  @ApiProperty({
    example: 'Doe',
    description: 'User last name',
  })
  @IsOptional()
  @MinLength(2)
  last_name?: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    example: '+11234567890',
    description: 'US mobile number with country code',
  })
  @IsOptional()
  @Matches(/^\+1[0-9]{10}$/, {
    message: 'Mobile number must be in format: +1XXXXXXXXXX (10 digits after country code)'
  })
  mobile?: string;

  @ApiProperty({
    example: 'Computer Science',
    description: 'User major/field of study',
  })
  @IsOptional()
  @MinLength(2)
  major?: string;

  @ApiProperty({
    example: '******',
    description: 'User password',
  })
  @IsOptional()
  @MinLength(8)
  password?: string;

  @ApiProperty({
    example: 'image url',
    description: 'user profile image link/url',
  })
  @IsOptional()
  profileImage?: string;
}