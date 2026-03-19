import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { OpenDentalService } from '../opendental/opendental.service';
import { ClinicKeysModule } from '../clinic-keys/clinic-keys.module';
import { PracticeController } from './practice.controller';
import { PracticeService } from './practice.service';
import { PracticeRepository } from './practice.repository';
import { AuditRepository } from '../audit/audit.repository';
import { ClinicContext } from 'src/common/context/clinic-context.provider';
import { AuditModule } from '../audit/audit.module';
import { CommonModule } from 'src/common/common.module';


@Module({
  imports: [HttpModule, ClinicKeysModule, CommonModule, AuditModule],
  controllers: [PracticeController],
  providers: [OpenDentalService, PracticeService, PracticeRepository],
  exports: [PracticeService, PracticeRepository],
})
export class PracticeModule {}