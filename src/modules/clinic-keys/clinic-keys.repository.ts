import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CommonService } from '../../common/common.service';

@Injectable()
export class ClinicKeysRepository {
  constructor(private readonly dataSource: DataSource, private readonly commonService: CommonService) {}

  async findActiveByClinicId(practiceGuid: string) {
    const [rows] = await this.dataSource.query(
      `
      SELECT
        ck.clinic_id,
        ck.developer_key,
        ck.customer_key
      FROM clinic_keys ck
      Left JOIN clinic c ON ck.clinic_id = c.id
      WHERE c.unique_id = ?
        AND ck.is_active = 1
        AND c.active = 1
      LIMIT 1
      `,
      [practiceGuid],
    );

    return rows ?? null;
  }

  async findActiveByAccountId(practiceGuid: string) {
    const [rows] = await this.dataSource.query(
      `
      SELECT
        ck.clinic_id,
        ck.developer_key,
        ck.customer_key
      FROM clinic_keys ck
      Left JOIN clinic c ON ck.clinic_id = c.id
      WHERE c.unique_id = ?
        AND ck.is_active = 1
        AND c.active = 1
      LIMIT 1
      `,
      [practiceGuid],
    );

    return rows ?? null;
  }

}
