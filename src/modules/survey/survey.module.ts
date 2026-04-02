import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Survey } from './entity/survey.entity';
import { SurveyController } from './survey.controller';
import { SurveyService } from './survey.service';
import { User } from '../user/entity/user.entity';
import { PartyMaster } from '../party/entity/party.entity';
import { SurveyParty } from '../survey-party/entity/survey-party.entity';
import { EmailService } from 'src/shared/email/email.service';


@Module({
  imports: [TypeOrmModule.forFeature([Survey, User, SurveyParty, PartyMaster])],
  controllers: [SurveyController],
  providers: [SurveyService, EmailService],
  exports: [SurveyService],
})
export class SurveyModule {}