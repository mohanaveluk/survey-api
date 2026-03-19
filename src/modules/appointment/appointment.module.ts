/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { AppointmentController } from './appointment.controller';
import { AppointmentService } from './appointment.service';
import { CommonModule } from 'src/common/common.module';
import { AuditModule } from '../audit/audit.module';
import { OpenDentalService } from '../opendental/opendental.service';
import { HttpModule } from '@nestjs/axios';
import { ClinicKeysModule } from '../clinic-keys/clinic-keys.module';
import { AppointmentRepository } from './appointment.repository';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AppointmentToken } from 'src/shared/utils/appointment-token';

@Module({
    imports: [HttpModule, ClinicKeysModule, CommonModule, AuditModule,
        ConfigModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                secret: config.get<string>('APPOINTMENT_JWT_SECRET'),
                signOptions: {
                    expiresIn:  config.get<number>('APPOINTMENT_TOKEN_TTL') || 600,
                    issuer: 'appointment-service',
                    audience: 'public-scheduler',
                },
            }),

        }),
    ],
    controllers: [AppointmentController],
    providers: [AppointmentService,  AppointmentRepository, OpenDentalService, AppointmentToken],
    exports: [AppointmentService,  AppointmentRepository, AppointmentToken]
})
export class AppointmentModule {}
