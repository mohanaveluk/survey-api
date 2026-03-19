import { IsEmail, IsNotEmpty, Matches, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateContactDto {
  @ApiProperty({
    example: 'John Doe',
    description: 'Full name of the contact',
  })
  @IsNotEmpty()
  @MinLength(3)
  fullName: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Email address',
  })
  @IsEmail({}, {
    message: 'Please provide a valid email address'
  })
  @Matches(
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    {
      message: 'Invalid email format. Example: user@example.com'
    }
  )
  email: string;

  @ApiProperty({
    example: '+11234567890',
    description: 'US mobile number with country code',
  })
  @IsNotEmpty()
  @Matches(/^\+1[0-9]{10}$/, {
    message: 'Mobile number must be in format: +1XXXXXXXXXX (10 digits after country code)'
  })
  mobile: string;

  @ApiProperty({
    example: 'I would like to inquire about your services...',
    description: 'Message content',
  })
  @IsNotEmpty()
  @MinLength(10)
  message: string;

  
  @ApiProperty({
    example: 'I would like to inquire about your services...',
    description: 'Message subject',
  })
  @IsNotEmpty()
  subject: string;
}