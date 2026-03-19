import { Injectable, Scope, UnauthorizedException } from '@nestjs/common';
import { ClinicKeysRepository } from './clinic-keys.repository';
import { ClinicContext } from '../../common/context/clinic-context.provider';
import { IntegerType } from 'typeorm';
import { PracticeRepository } from '../practice/practice.repository';

@Injectable({ scope: Scope.REQUEST })
export class ClinicKeysService {
  private cache = new Map<string, any>();

  constructor(
    private readonly repo: ClinicKeysRepository,
    private readonly practiceRepository: PracticeRepository,
    private readonly clinicContext: ClinicContext,
  ) {}

  async getKeys() {

    let practiceGuid = "";

    try {

      const accountGuid = this.clinicContext.accountGuid as string;

      if (this.cache.has(accountGuid.toString())) {
        const keys = this.cache.get(accountGuid.toString());
        return {
          developerKey: keys.developer_key,
          customerKey: keys.customer_key,
        };
      }

      const practiceList = await this.practiceRepository.getClinicsByAccountId(accountGuid);

      if (practiceList != null && practiceList.length > 0) {
        practiceGuid = practiceList[0].unique_id;
      }




      const keys = await this.repo.findActiveByClinicId(practiceGuid.toString());
      //const keys = await this.repo.getClinicsByAccountId(accountGuid.toString());

      if (!keys) {
        throw new UnauthorizedException(
          `OpenDental keys not configured for clinic ${accountGuid}`,
        );
      }
      this.cache.set(accountGuid.toString(), keys);

      return {
        developerKey: keys.developer_key,
        customerKey: keys.customer_key,
      };
    } catch (error) {
      throw error;
    }

  }


}