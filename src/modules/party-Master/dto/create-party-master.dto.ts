import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePartyMasterDto {
  // @ApiProperty({
  //   example: 'PARTY001',
  //   description: 'Unique identifier for the party',
  // })
  // @IsNotEmpty()
  // @IsString()
  // @MaxLength(50)
  // id: string;

  @ApiProperty({
    example: 'Democratic Party',
    description: 'Name of the political party',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({
    example: '#FF0000',
    description: 'Hex color code representing the party',
  })
  @IsOptional()
  @IsString()
  @MaxLength(7)
  color?: string;

  @ApiPropertyOptional({
    example: 'John Smith',
    description: 'Name of the party leader',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  leader_name?: string;

  @ApiPropertyOptional({
    example: 'Jane Doe',
    description: 'Name of the party contestant',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  contestant_name?: string;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Party logo image file (JPEG, PNG, GIF, WebP - max 5MB)',
  })
  logo?: any; // This will be handled by multer  


  @ApiPropertyOptional({
    type: String,
    example: 'https://example.com/logo.png',
    description: 'URL of the party logo if not uploading a file',
  })
  @IsOptional()
  @IsString()
  logo_url?: string; // Optional URL for the logo if not uploading a file

  @ApiPropertyOptional({
    example: 'admin@system.com',
    description: 'Email or ID of the user who created the survey',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  createdBy?: string;

  @ApiPropertyOptional({ example: '2024-01-01T00:00:00Z', description: 'Creation timestamp of the party' })
  @IsOptional()
  @IsString()
  createdAt?: Date;

  @ApiPropertyOptional({
    example: 'United States',
    description: 'Country where the party is based',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  country?: string;

}
