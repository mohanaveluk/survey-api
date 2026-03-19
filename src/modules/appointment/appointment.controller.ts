/*
https://docs.nestjs.com/controllers#controllers
*/

import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Query } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OpenDentalService } from '../opendental/opendental.service';
import { ClinicContext } from 'src/common/context/clinic-context.provider';
import { AppointmentService } from './appointment.service';
import { ResponseDto } from 'src/common/dto/response.dto';
import { GetAvailabilityQueryDto } from './get-availability.query.dto';

@ApiTags('scheduleAppointment')
@Controller('scheduleAppointment')
export class AppointmentController {
    constructor(
        private readonly service: OpenDentalService, 
        private readonly clinicContext: ClinicContext, 
        private readonly appointmentService: AppointmentService) { }


    @Get('visitreason-account/:accountGuid/:practiceGuid')
    @ApiOperation({ summary: 'Get Visit Reasons for a Practice' })
    @ApiResponse({ status: 200, description: 'Visit reasons retrieved successfully' })
    @ApiResponse({ status: 400, description: 'Bad request - validation error' })

    async getVisitReasons(@Param('accountGuid') accountGuid: string, @Param('practiceGuid') practiceGuid: string) {
        try {
            const visitReasons = await this.appointmentService.getVisitReasons(accountGuid, practiceGuid);
            if(visitReasons !== null && visitReasons.status){
                return  {status: "true", message: 'Visit reasons retrieved successfully', rawResult: visitReasons.actualResponse, result: visitReasons.result};
            }
            return  {status: "false", message: visitReasons.message, rawResult: null, result: null };
        } catch (error) {
            const errorMessage = `Failed to retrieve Visit reasons ${error.message}`;
            throw new HttpException(
                 errorMessage,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }


    @Get('availability/:accountGuid/:practiceGuid/:reasonId/:startDate/:endDate')
    @ApiOperation({ summary: 'Get slots for appointment availability' })
    @ApiResponse({ status: 200, description: 'Availability slots retrieved successfully' })
    @ApiResponse({ status: 400, description: 'Bad request - validation error' })
    // @ApiQuery({
    //     name: 'opNums',
    //     required: false,
    //     type: String,
    //     description: 'Comma separated operatory numbers',
    //     example: '3,7,9'
    // })

    @ApiParam({
        name: 'endDate',
        required: true,
        type: String,
        example: '2026-02-27'
    })
    @ApiParam({
        name: 'startDate',
        required: true,
        type: String,
        example: '2026-02-18'
    })
    @ApiParam({
        name: 'reasonId',
        required: true,
        type: Number,
        example: 22
    })
    @ApiParam({
        name: 'practiceGuid',
        required: true,
        type: String,
        example: 'abc-123'
    })
    @ApiParam({
        name: 'accountGuid',
        required: true,
        type: String,
        example: 'abc-123'        
    })
    async getScheduleAvailability(@Param() query: GetAvailabilityQueryDto) {
        const { accountGuid, practiceGuid, startDate, endDate, reasonId } = query;
        try {
            const slots = await this.appointmentService.getAvailability(accountGuid, practiceGuid, reasonId, startDate, endDate );
            return new ResponseDto(true, 'Successfully received availability slots', slots);

        } catch (error) {
            return  new ResponseDto(false, 'Failed to retrieve availability', null, error.message);
        }
    }


    @Post('token')
    @ApiOperation({summary: 'to get temp token for appointment'})
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                practiceId: { type: 'string' },
                source: { type: 'string' },
                metadata: {
                    type: 'object',
                    additionalProperties: true,
                },
            },
            required: ['clinicId'],
        },
    })
    async generateToken(@Body() payload: Record<string, any>) {
        const token = await this.appointmentService.generateAppointmentToken(payload);
        return {
            success: true,
            token,
        };
    }
}
