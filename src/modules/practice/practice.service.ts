/*
https://docs.nestjs.com/providers#services
*/

import { Injectable } from '@nestjs/common';
import { PracticeRepository } from './practice.repository';

@Injectable()
export class PracticeService {
    
    constructor(private practiceRepository: PracticeRepository) { }

    async getPractice(accountGuid: string) {
        
        try {
            //return await this.practiceRepository.getPractice(practiceGuid);
            return await this.practiceRepository.getClinicsByAccountId(accountGuid);

        } catch (error) {
            throw error.message;
        }
    }


}
