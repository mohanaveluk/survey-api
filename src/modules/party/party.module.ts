import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PartyService } from './party.service';
import { PartyController } from './party.controller';
import { PartyMaster } from './entity/party.entity';
import { CloudStorageService } from 'src/common/services/cloud-storage.service';
import { User } from '../user/entity/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PartyMaster, User])],
  controllers: [PartyController],
  providers: [PartyService, CloudStorageService],
  exports: [PartyService],
})
export class PartyModule {}