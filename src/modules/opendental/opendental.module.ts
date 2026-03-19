import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { OpenDentalService } from './opendental.service';
import { ClinicKeysService } from '../clinic-keys/clinic-keys.service';
import { ClinicKeysModule } from '../clinic-keys/clinic-keys.module';
import { ClinicContext } from 'src/common/context/clinic-context.provider';
import { CommonModule } from 'src/common/common.module';

@Module({
  imports: [HttpModule, ClinicKeysModule, CommonModule],
  providers: [OpenDentalService],
  exports: [OpenDentalService],
})
export class OpenDentalModule {}