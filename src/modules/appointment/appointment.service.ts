/*
https://docs.nestjs.com/providers#services
*/

import { Injectable, NotFoundException } from '@nestjs/common';
import { AppointmentRepository } from './appointment.repository';
import { OpenDentalService } from '../opendental/opendental.service';
import { ExceptionHandler } from 'winston';
import { AppointmentToken } from 'src/shared/utils/appointment-token';
import { CommonService } from 'src/common/common.service';

@Injectable()
export class AppointmentService {

    constructor(private appointmentRepository: AppointmentRepository, private readonly service: OpenDentalService, private readonly appointmentToken: AppointmentToken, private readonly commonService: CommonService) { }

    async getVisitReasons(accountGuid:string, practiceGuid: string) {
        try {
            return await this.appointmentRepository.getvistReasons(accountGuid, practiceGuid);
        } catch (error) {
            throw error.message;
        }
    }

    async getAvailability(accountGuid: string, practiceGuid: string, reasonId: number, startDate: string, endDate: string ) {
        let combinedAvailability = [];

        const providerList = await this.appointmentRepository.getProviders(accountGuid);
        if(providerList === null || (providerList !== null && providerList.length <= 0)){
            throw new NotFoundException('Provider not found');
        }
        const npi = providerList[0].NPI;
        const operatorResult = await this.appointmentRepository.getOperatory(accountGuid, practiceGuid, reasonId, npi);
        if(operatorResult === null || (operatorResult != null && operatorResult.length <= 0)){
            throw new NotFoundException('Operatory not found');
        }
        var operatory = [...new Set(operatorResult.map((p: { OperatoryNum: any; }) => Number(p.OperatoryNum)))];

        try {
            const nStartDate = normalizeStartDate(startDate);
            const schedules = await this.getSchedule(nStartDate, endDate);

            const providerList = await this.service.callApi({
                    method: 'GET',
                    endpoint: '/providers',
                    params: { },
                });

            for (const element of operatory) {
                let slots = await this.service.callApi({
                    method: 'GET',
                    endpoint: '/appointments/Slots',
                    params: { dateStart: nStartDate, dateEnd: endDate, OpNum: element },
                });
                if(slots.data !=null && Array.isArray(slots.data) && slots.data.length > 0){
                    combinedAvailability.push(...slots.data);
                }
                await new Promise(res => setTimeout(res, 300)); // 🔥 REQUIRED
            };

            const formattedAvailability = await this.buildAvailabilityByDateWithOpNum(combinedAvailability, startDate, endDate);
            const uniqueProvNums: number[] = [
                ...new Set(combinedAvailability.map(item => Number(item.ProvNum))),
            ];
            const activeProviders = providerList.data !== null && providerList.data.length > 0 ? providerList.data.filter((provider: any) => provider.IsHidden === "false"): [];
            const filteredProviders = providerList.data.filter(provider => uniqueProvNums.includes(Number(provider.ProvNum)));

            return {slots: formattedAvailability, providers: filteredProviders, schedule: schedules};
        } catch (error) {
            throw error;
        }
    }

    async getProvidersByAccount(accountGuid: string){
        var providerResult = [];

        try {
            const providerResponse = await this.appointmentRepository.getProviders(accountGuid);
            if (providerResponse !== null && providerResponse.length > 0 && providerResponse[0].length > 0) {
                //providerResponse[0] = await this.getProviderPracticeMappingByAccount(accountGuid, providerResponse[0]);
                //providerResponse[0] = await this.getProviderSpecialityMappingByAccount(accountGuid, providerResponse[0]);

                providerResult = providerResponse[0];
                return { status: true, message: '', result: providerResult };
            }
            return {status: false, message: 'Provider does not exist at this moment'};
        } catch (error) {
            return { status: false, message: error.message };
        }

    }

    async buildAvailabilityByDateWithOpNum(availability: any[],
        startDate: string,
        endDate: string,
        slotMinutes = 60) {
        const resultMap = {};

        const formatTime = (date) => {
            let hours = date.getHours();
            const minutes = date.getMinutes().toString().padStart(2, '0');
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12 || 12;
            return `${hours.toString().padStart(2, '0')}:${minutes} ${ampm}`;
        };

        for (const item of availability) {
            const start = new Date(item.DateTimeStart.replace(' ', 'T'));
            const end = new Date(item.DateTimeEnd.replace(' ', 'T'));

            // Ignore zero-length slots
            if (start.getTime() >= end.getTime()) continue;

            const dateKey = start.toISOString().split('T')[0];

            if (!resultMap[dateKey]) {
                resultMap[dateKey] = {
                    slots: new Set(),
                    opNum: new Set(),
                    provNum: new Set()
                };
            }

            let current = new Date(start);

            while (current.getTime() + slotMinutes * 60000 <= end.getTime()) {
                resultMap[dateKey].slots.add(formatTime(current));
                resultMap[dateKey].opNum.add(item.OpNum);
                resultMap[dateKey].provNum.add(item.ProvNum);
                current = new Date(current.getTime() + slotMinutes * 60000);
            }
        }

        // Convert to required output format
        /*
        return Object.keys(resultMap)
            .sort()
            .map(date => ({
                date,
                slots: Array.from(resultMap[date].slots),
                opNum: Array.from(resultMap[date].opNums)
            }))
            .filter(entry => entry.slots.length > 0); // ignore dates with no slots
        */
        // ---------- iterate full date range ----------
        const output: any[] = [];

        const current = this.commonService.parseLocalDate(startDate);
        const last = this.commonService.parseLocalDate(endDate);
        current.setHours(0, 0, 0, 0);
        last.setHours(0, 0, 0, 0);

        while (current <= last) {
            const dateKey = current.toISOString().slice(0, 10);
            const dayData = resultMap[dateKey] || null;

            output.push({
                date: dateKey,
                slots: dayData ? Array.from(dayData.slots) : [],
                opNum: dayData ? Array.from(dayData.opNum) : [],
                provNum: dayData ? Array.from(dayData.provNum) : [],
            });

            current.setDate(current.getDate() + 1);
        }

        return output;
    }

    async generateAppointmentToken(payLoad: Record<string, any>){
        return this.appointmentToken.generateAppointmentToken(payLoad);
    }

    async getSchedule(startDate: string, endDate: string){
        let minStartTime = '09:00:00';
        let maxStopTime = '18:00:00';

        try {
            const schedules = await this.service.callApi({
                method: 'GET',
                endpoint: '/schedule',
                params: { dateStart: startDate, dateEnd: endDate, SchedType: 'Provider'},
            });

            if(schedules.data == null || !Array.isArray(schedules.data) || schedules.data.length <= 0){
                return {startTime: minStartTime, endTime: maxStopTime};
            }

            for (const s of schedules.data) {
                if (!minStartTime || s.StartTime < minStartTime) {
                    minStartTime = s.StartTime;
                }

                if (!maxStopTime || s.StopTime > maxStopTime) {
                    maxStopTime = s.StopTime;
                }
            }

            return {startTime: minStartTime, endTime: maxStopTime};
        } catch (error) {
            return {startTime: minStartTime, endTime: maxStopTime};
        }
    }

    /*async getProviderPracticeMapping(guid, providers){
        var practices = [];
        var [practiceMapping] = await providerModel.getProviderPracticeMapping(guid);
        if (practiceMapping !== null && practiceMapping.length > 0 && practiceMapping[0].length > 0){
            for (let index = 0; index < providers.length; index++) {
                const element = providers[index];
                var practiceList = practiceMapping[0].filter(p => p.provider_id === element.id);
                practices = [];
                practiceList.forEach(practice => {
                    practices.push({practice_id: practice.practice_id, practice_name: practice.practice_name, practice_unique_id: practice.practice_unique_id, provider_id: practice.provider_id});
                });
                element.practices = practices;
            }
        }
        return providers;
    }

    async getProviderPracticeMappingByAccount(accountGuid, providers){
        var practices = [];
        var [practiceMapping] = await providerModel.getProviderPracticeMappingByAccount(accountGuid);
        if (practiceMapping !== null && practiceMapping.length > 0 && practiceMapping[0].length > 0){
            for (let index = 0; index < providers.length; index++) {
                const element = providers[index];
                var practiceList = practiceMapping[0].filter(p => p.provider_id === element.id);
                practices = [];
                practiceList.forEach(practice => {
                    practices.push({practice_id: practice.practice_id, practice_name: practice.practice_name, practice_unique_id: practice.practice_unique_id, provider_id: practice.provider_id});
                });
                element.practices = practices;
            }
        }
        return providers;
    }


    async getProviderSpecialityMappingByAccount(accountGuid, providers){
        var practices = [];
        var [practiceMapping] = await providerModel.getProviderSpecialityMappingByAccount(accountGuid);
        if (practiceMapping !== null && practiceMapping.length > 0 && practiceMapping[0].length > 0){
            for (let index = 0; index < providers.length; index++) {
                const element = providers[index];
                var practiceList = practiceMapping[0].filter(p => p.provider_id === element.id);
                practices = [];
                practiceList.forEach(practice => {
                    practices.push({speciality_id: practice.speciality_id, speciality_name: practice.speciality_name, speciality_mapper_id: practice.id, provider_id: practice.provider_id});
                });
                element.specialities = practices;
            }
        }
        return providers;
    }*/
}

function normalizeStartDate(startDate: string): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const inputDate = new Date(startDate);
  inputDate.setHours(0, 0, 0, 0);

  return inputDate < today
    ? today.toISOString().slice(0, 10)
    : startDate;
}