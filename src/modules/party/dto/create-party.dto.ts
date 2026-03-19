import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePartyDto {
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
    type: 'string',
    format: 'binary',
    description: 'Party logo image file (JPEG, PNG, GIF, WebP - max 5MB)',
  })
  logo?: any; // This will be handled by multer  
}
