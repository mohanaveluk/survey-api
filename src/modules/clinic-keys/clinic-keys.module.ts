import { Module } from '@nestjs/common';

import { ClinicKeysService } from './clinic-keys.service';
import { ClinicKeysRepository } from './clinic-keys.repository';
import { ClinicContext } from '../../common/context/clinic-context.provider';
import { CommonModule } from 'src/common/common.module';
import { PracticeRepository } from '../practice/practice.repository';


@Module({
  imports: [CommonModule],
  providers: [ClinicKeysRepository, PracticeRepository, ClinicKeysService],
  exports: [ClinicKeysService],
})
export class ClinicKeysModule {}