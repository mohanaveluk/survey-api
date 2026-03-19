import { Transform } from 'class-transformer';
import { IsArray, IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class GetAvailabilityQueryDto {

  @IsString()
  @IsNotEmpty()
  accountGuid: string;
  
  @IsString()
  @IsNotEmpty()
  practiceGuid: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;
  
  @IsNotEmpty()
  reasonId: number;

//   @IsArray()
//   @Transform(({ value }) =>
//     typeof value === 'string'
//       ? value.split(',').map(v => Number(v.trim())).filter(v => !isNaN(v))
//       : []
//   )
//   opNums: number[];
}
