/*
https://docs.nestjs.com/providers#services
*/

import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CommonService } from '../../common/common.service';

@Injectable()
export class PracticeRepository {
    constructor(private readonly dataSource: DataSource, private readonly commonService: CommonService) { }

    async getPractice(practiceGuid: string) {
        const [rows] = await this.dataSource.query(
            `
        SELECT
            p.id,
            p.name,
            p.unique_id,
            CONCAT(p.address1, ' ', IFNULL(CONCAT(p.address2, ' '),''), IFNULL(CONCAT(p.city, ' '),''), p.state, ' ', p.zip) as clinic_address,
            p.address1,
            p.address2,
            p.city,
            p.state,
            p.zip,
            p.country,
            p.primary_contact,
            p.primary_phone,
            p.primary_email,
            p.dentist_name,
            p.website,
            p.appt_request_page,
            p.logo_url,
            (select moment_timezone from clinic_states where state_code = p.state  or state_name = p.state) as moment_timezone,
            p.timezone
        FROM clinic p
        WHERE p.unique_id = ?
          AND p.active = 1
        LIMIT 1
      `,
            [practiceGuid],
        );
        return rows ?? null;
    }

    async getClinicsByAccountId(account_guid: string) {
        var clinicList = [];
        try {
            const sql = `CALL proc_get_pracatices_by_account_id(?)`;
            const params = [account_guid];
            const clinics = await this.dataSource.query(sql, params);

            if (clinics !== null && clinics.length > 0 && clinics[0].length > 0) {
                for (let index = 0; index < clinics[0].length; index++) {
                    const element = clinics[0][index];
                    element.clinic_logo = this.commonService.isNullOrEmpty(element.clinic_logo) ? "" : element.clinic_logo.replace('storage.cloud.google.com', 'storage.googleapis.com');
                }
                clinicList = clinics[0];
            }

            return clinicList;

        } catch (error) {
            throw error;
        }
    }

}
