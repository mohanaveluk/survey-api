import { UserService } from './modules/user/user.service';
import { UserController } from './modules/user/user.controller';
import { AppointmentModule } from './modules/appointment/appointment.module';
import { AppointmentService } from './modules/appointment/appointment.service';
import { AppointmentController } from './modules/appointment/appointment.controller';
import { PracticeService } from './modules/practice/practice.service';
import { PracticeController } from './modules/practice/practice.controller';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { adminConfig, getDatabaseConfig, googleCloudConfig, jwtConfig, smtpConfig } from './config/configuration';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/typeorm.config';
import { OpenDentalModule } from './modules/opendental/opendental.module';
import { OpenDentalController } from './modules/opendental/opendental.controller';
import { ClinicKeysModule } from './modules/clinic-keys/clinic-keys.module';
import { AuditModule } from './modules/audit/audit.module';
import { PracticeModule } from './modules/practice/practice.module';
import { CommonModule } from './common/common.module';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { ContactModule } from './modules/contact/contact.module';
import { PartyModule } from './modules/party/party.module';
import { SurveyModule } from './modules/survey/survey.module';
import { SurveyPartyModule } from './modules/survey-party/survey-party.module';
import { VoteModule } from './modules/vote/vote.module';
import { ChatModule } from './modules/chat/chat.module';


@Module({
  imports: [
    AppointmentModule,
    ConfigModule.forRoot({
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
      load: [getDatabaseConfig, jwtConfig, adminConfig, googleCloudConfig, smtpConfig],
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: typeOrmConfig,
    }),
    CommonModule,
    AuthModule,
    AuditModule,
    ClinicKeysModule,
    OpenDentalModule,
    PracticeModule,
    UserModule,
    AppointmentModule,
    ContactModule,
    PartyModule,
    SurveyModule,
    SurveyPartyModule,
    VoteModule,
    ChatModule
  ],
  controllers: [
    UserController,
    AppointmentController,
    PracticeController, AppController, OpenDentalController],
  providers: [
    UserService,
    AppointmentService,
    PracticeService, AppService],
})
export class AppModule {
  // configure(consumer: MiddlewareConsumer) {
  //   consumer.apply(ClinicContextMiddleware).forRoutes('*');
  // }
}