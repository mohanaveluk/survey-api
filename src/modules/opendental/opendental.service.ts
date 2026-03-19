import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { AxiosRequestConfig } from 'axios';
import { firstValueFrom } from 'rxjs';
import { ClinicKeysService } from '../clinic-keys/clinic-keys.service';
import * as http from 'http';
import * as https from 'https';

const httpAgent = new http.Agent({
  keepAlive: true,
  maxSockets: 10,
  keepAliveMsecs: 30000,
});

const httpsAgent = new https.Agent({
  keepAlive: true,
  maxSockets: 10,
  keepAliveMsecs: 30000,
});

@Injectable()
export class OpenDentalService {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly customerKey: string;
  private readonly developerKey: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly clinicKeysService: ClinicKeysService
  ) {
    this.baseUrl = this.configService.get('opendental.baseUrl');
    this.apiKey = this.configService.get('opendental.customerKey');
    this.customerKey = this.configService.get('opendental.customerKey');
    this.developerKey = this.configService.get('opendental.developerKey');
    this.httpService.axiosRef.defaults.timeout = 20000;
    this.httpService.axiosRef.defaults.maxRedirects = 0;
  }

  /**
   * Generic OpenDental API Caller
   */
  async callApi<T = any>(options: {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    endpoint: string;
    params?: Record<string, any>;
    data?: any;
    headers?: Record<string, string>;
  }): Promise<{
    success: boolean;
    status: number;
    data?: T;
    error?: any;
  }> {
    const { developerKey, customerKey } =
      await this.clinicKeysService.getKeys();
    
    options.params
    const config: AxiosRequestConfig = {
      method: options.method,
      url: `${this.baseUrl}${options.endpoint}`,
      params: options.params,
      data: options.data,
      timeout: 30000, // 30 seconds (DO NOT skip)
      maxRedirects: 0,
      httpAgent,
      httpsAgent,
      headers: {
        'Content-Type': 'application/json',
        Connection: 'close',
        Authorization: `ODFHIR ${developerKey}/${customerKey}`,
        ...options.headers,
      },
    };

    try {
      const response = await firstValueFrom(
        this.httpService.request<T>(config),
      );

      return {
        success: true,
        status: response.status,
        data: response.data,
      };
    } catch (error: any) {
      const status =
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;

      throw new HttpException(
        {
          success: false,
          status,
          error: error.response?.data || error.message,
          message: error.response?.data || error.message
          
        },
        status,
      );
    }
  }
}