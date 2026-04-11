import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Country } from './entity/country.entity';
import { CountryService } from './country.service';
import { CountryController } from './country.controller';
 
@Module({
  imports: [
    // Register the Country entity so its repository is available for injection
    TypeOrmModule.forFeature([Country]),
  ],
  controllers: [CountryController],
  providers:   [CountryService],
  // Export CountryService so other modules (e.g. PartyMasterModule)
  // can inject it without re-importing the full module
  exports:     [CountryService],
})
export class CountryModule {}