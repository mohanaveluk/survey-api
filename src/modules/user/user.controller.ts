/*
https://docs.nestjs.com/controllers#controllers
*/

import { Controller, Get, HttpException, HttpStatus, Param, UseInterceptors } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuditInterceptor } from '../audit/audit.interceptor';
import { UserService } from './user.service';
import { ResponseDto } from 'src/common/dto/response.dto';

@Controller('User')
@UseInterceptors(AuditInterceptor)
@ApiTags('user')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Get('validate/:unique_id')
    @ApiOperation({ summary: 'Validate User Account' })
    @ApiResponse({ status: 200, description: 'User account validated successfully.' })
    @ApiResponse({ status: 400, description: 'Validation failed.' })
    async validateUserAccount(@Param('unique_id') uniqueId: string): Promise<{ message: string }> {
        try {
            // Call the service method to validate the user account
            const result = await this.userService.validateAccount(uniqueId);
            return new ResponseDto(true, null, result );
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
    }
}
