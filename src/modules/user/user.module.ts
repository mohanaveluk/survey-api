import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { OpenDentalService } from '../opendental/opendental.service';
import { ClinicKeysModule } from '../clinic-keys/clinic-keys.module';
import { ClinicContext } from 'src/common/context/clinic-context.provider';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { AuditInterceptor } from '../audit/audit.interceptor';
import { AuditRepository } from '../audit/audit.repository';

@Module({
  imports: [HttpModule, ClinicKeysModule],
  controllers: [UserController],
  providers: [OpenDentalService, UserRepository, UserService, AuditInterceptor, AuditRepository, ClinicContext],
  exports: [UserService, UserRepository ],
})
export class UserModule {}