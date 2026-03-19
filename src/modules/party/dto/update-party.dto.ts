import { PartialType, OmitType, ApiPropertyOptional } from '@nestjs/swagger';
import { CreatePartyDto } from './create-party.dto';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdatePartyDto extends PartialType(CreatePartyDto) {
  @ApiPropertyOptional({ 
    example: 'Democratic Party Updated',
    description: 'Updated name of the political party'
  })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  name?: string;

  @ApiPropertyOptional({ 
    example: '#00FF00',
    description: 'Updated hex color code representing the party'
  })
  @IsOptional()
  @IsString()
  @MaxLength(7)
  color?: string;

  @ApiPropertyOptional({ 
    example: 'Jane Doe',
    description: 'Updated name of the party leader'
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  leader_name?: string;

  @ApiPropertyOptional({ 
    type: 'string',
    format: 'binary',
    description: 'Updated party logo image file (JPEG, PNG, GIF, WebP - max 5MB)'
  })
  logo?: any; // This will be handled by multer
}
