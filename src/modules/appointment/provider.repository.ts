import { Injectable } from "@nestjs/common";
import { CommonService } from "src/common/common.service";
import { DataSource } from "typeorm";

//need to code all the providers related...
@Injectable()
export class AppointmentRepository {
    constructor(
        private readonly dataSource: DataSource,
        private readonly commonService: CommonService, // Inject commonService
    ) { }

    async getProviderPracticeMapping(guid){

    }


    
}