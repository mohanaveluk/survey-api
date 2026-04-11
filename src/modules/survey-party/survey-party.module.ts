import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SurveyPartyService } from './survey-party.service';
import { SurveyParty } from './entity/survey-party.entity';
import { Survey } from '../survey/entity/survey.entity';
import { Party } from '../party/entity/party.entity';
import { SurveyPartyController } from './survey-party.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Survey, SurveyParty, Party])],
  controllers: [SurveyPartyController],
  providers: [SurveyPartyService],
  exports: [SurveyPartyService],
})
export class SurveyPartyModule {}