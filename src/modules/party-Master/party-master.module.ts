import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PartyMasterService } from './party-master.service';
import { PartyMasterController } from './party-master.controller';
import { PartyMaster } from './entity/party-master.entity';
import { CloudStorageService } from 'src/common/services/cloud-storage.service';
import { User } from '../user/entity/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PartyMaster, User])],
  controllers: [PartyMasterController],
  providers: [PartyMasterService, CloudStorageService],
  exports: [PartyMasterService],
})
export class PartyMasterModule {}