import { Controller, Get, HttpException, HttpStatus, Param, Query, UseInterceptors } from '@nestjs/common';
import { OpenDentalService } from '../opendental/opendental.service';
import { ClinicContext } from 'src/common/context/clinic-context.provider';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PracticeService } from './practice.service';
import { ResponseDto } from 'src/common/dto/response.dto';
import { AuditInterceptor } from '../audit/audit.interceptor';

@ApiTags('Practice')
@UseInterceptors(AuditInterceptor)
@Controller('practice/:accountGuid')
export class PracticeController {
    constructor(private readonly service: OpenDentalService, private readonly practiceService: PracticeService) { }
    @Get()
    async getPractices(@Param('accountGuid') accountGuid: string) {
        try {
            const odClinics = await this.service.callApi({
                method: 'GET',
                endpoint: '/clinics',
                params: {},
            });

            //const clinicDetail = await this.practiceService.getPractice(practiceGuid);
            const clinicDetail = await this.practiceService.getPractice(accountGuid);

            console.log('clinicDetail', clinicDetail);

            return new ResponseDto(true, 'Practice details retrieved successfully', {
                openDentalClinics: (odClinics).data,
                clinics: clinicDetail
            });
        } catch (error) {
            throw new HttpException(
                new ResponseDto(false, 'Failed to retrieve Practice', null, error.message),
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    
}
