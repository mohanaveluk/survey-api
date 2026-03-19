import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { VoteService } from './vote.service';
import { VoteController } from './vote.controller';
import { Vote } from './entity/vote.entity';
import { Survey } from '../survey/entity/survey.entity';
import { PartyController } from '../party/party.controller';
import { PartyMaster } from '../party/entity/party.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Vote, Survey, PartyMaster])],
  controllers: [VoteController],
  providers: [VoteService],
})
export class VoteModule {}