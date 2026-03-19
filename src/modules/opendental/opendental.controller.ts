import { Controller, Get, Param, Query } from '@nestjs/common';
import { OpenDentalService } from './opendental.service';
import { ClinicContext } from 'src/common/context/clinic-context.provider';

@Controller('opendental')
export class OpenDentalController {
  constructor(private readonly service: OpenDentalService, private readonly clinicContext: ClinicContext) { }

  @Get('patients')
  async getPatients(@Query('practiceGuid') practiceGuid: string) {
    this.clinicContext.setPracticeGuid(practiceGuid);

    return this.service.callApi({
      method: 'GET',
      endpoint: '/patients',
      params: practiceGuid ? { practiceGuid } : {},
    });
  }


}