import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { VoteService } from './vote.service';
import { VoteController } from './vote.controller';
import { Vote } from './entity/vote.entity';
import { Survey } from '../survey/entity/survey.entity';
import { PartyController } from '../party/party.controller';
import { Party } from '../party/entity/party.entity';
import { TempVote } from './entity/temp-vote.entity';
import { EmailService } from 'src/shared/email/email.service';
import { CustomLoggerService } from '../logger/custom-logger.service';
import { Log } from '../logger/entity/log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Log, Vote, TempVote, Survey, Party])],
  controllers: [VoteController],
  providers: [VoteService, EmailService, CustomLoggerService],
})
export class VoteModule {}