/*
https://docs.nestjs.com/providers#services
*/

import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CommonService } from '../../common/common.service'; // Adjust the path as needed
import { DataSource } from 'typeorm';


@Injectable()
export class AppointmentRepository {
        constructor(
            private readonly dataSource: DataSource,
            private readonly commonService: CommonService, // Inject commonService
        ) { }
    
    async getvistReasons(accountGuid:string, practiceGuid: string) {
        var visitReasonResult = [];
        interface VisitReason {
            reason: string;
            newPatient: object;
            currentPatient: object;
        }

        let visitReason: VisitReason;
        try {
            //const sql = `CALL sp_get_visit_reason_practice_nest(?)`;
            const sql = `CALL proc_get_visit_reason_account_practice(?, ?)`;
            const params = [accountGuid, practiceGuid];
            const visitReasonResponse = await this.dataSource.query(sql, params);

            if (visitReasonResponse !== null && visitReasonResponse.length > 0 && visitReasonResponse[0].length > 0) {
                var visitReasons = visitReasonResponse[0];
                let uniqueReasons = [...new Set(visitReasons.map(item => item.reason))];
                for (let index = 0; index < uniqueReasons.length; index++) {
                    const elementReason = uniqueReasons[index];
                    visitReason = {
                        reason: "",
                        newPatient: {},
                        currentPatient: {}
                    };

                    var npObject = visitReasons.filter(item => item.reason === elementReason && item.patient_type === 1);
                    var cpObject = visitReasons.filter(item => item.reason === elementReason && item.patient_type === 2);
                    visitReason.reason = elementReason.toString() || "";
                    visitReason.newPatient = !this.commonService.isNullOrEmpty(npObject) && npObject.length > 0 ? npObject[0] : {};
                    visitReason.currentPatient = !this.commonService.isNullOrEmpty(cpObject) && cpObject.length > 0 ? cpObject[0] : {};

                    visitReasonResult.push(visitReason);
                }

                return { status: true, message: '', result: visitReasonResult, actualResponse: visitReasonResponse[0] };
                //return visitReasonResult ?? null;
            }
            else{
                return { status: false, message: 'Yet to create visit reason for this account' };
            }
        } catch (error) {
            throw new InternalServerErrorException({
                message: 'Failed to execute patient merge procedure',
                error: error.message,
            });
        }
    }

    async getOperatory(accountGuid:string, practiceGuid: string, reasonId: number, npi: string) {

        try {

            const sql = `CALL proc_get_operatory_by_reason(?, ?, ?, ?)`;
            const params = [accountGuid, practiceGuid, reasonId, npi];

            const opNumbers = await this.dataSource.query(sql, params);

            return opNumbers !== null && opNumbers.length > 0 ? opNumbers[0]: [];
        } catch (error) {
            throw new NotFoundException(error);

        }
    }

    async getProviders(accountGuid:string) {

        try {

            const sql = `CALL proc_get_providers_by_account(?)`;
            const params = [accountGuid];

            const providers = await this.dataSource.query(sql, params);
            return providers !== null && providers.length > 0 ? providers[0]: [];

        } catch (error) {
            throw error;
        }
    }

    async getAvailability(startDate: string, endDate: string, reasonId: number){

        try {
            
        } catch (error) {
            
            
        }
    }
}
