import type { AxiosInstance } from 'axios';
import type { AxiosResponse } from 'axios';
import type { BadResponse } from './etherscan-api.interfaces';
import type { GetLastBlockResponse } from './etherscan-api.interfaces';
import type { GetBlockInfoResponse } from './etherscan-api.interfaces';
import type { EthereumTransaction } from './etherscan-api.interfaces';

import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import axios from 'axios';
import * as axiosRateLimit from 'axios-rate-limit';

import { EtherscanApiModuleOptions } from '../module';
import { ETHERSCAN_API_MODULE_OPTIONS } from '../module';

@Injectable()
export class EtherscanApiService {
  private static readonly etherscanApiUrl = 'https://api.etherscan.io/api';
  private readonly http: AxiosInstance;

  constructor(private readonly options: EtherscanApiModuleOptions) {
    // @ts-expect-error - axiosRateLimit is not typed
    this.http = axiosRateLimit(axios.create(), {
      maxRequests: options.maxRequests,
      perMilliseconds: options.perMilliseconds,
    });
  }

  public async getLastBlockNumber(): Promise<string> {
    const params = new URLSearchParams({
      module: 'proxy',
      action: 'eth_blockNumber',
      apiKey: this.options.apiKey,
    });
    const response = await this.makeGetRequest(
      `${EtherscanApiService.etherscanApiUrl}?${params.toString()}`,
    );
    const data = response.data as GetLastBlockResponse | BadResponse;
    const isBadResponse = this.isBadResponse(data);
    if (isBadResponse) {
      throw new Error(data.result);
    }
    const blockNumber = data.result;
    return blockNumber;
  }

  public async getLastBlocksNumbers(
    numberOfBlocks: number,
  ): Promise<Array<string>> {
    const lastBlockNumber = await this.getLastBlockNumber();
    const lastBlockNumberInt = parseInt(lastBlockNumber, 16);
    const blockNumbers = Array.from({ length: numberOfBlocks }, (_, i) =>
      (lastBlockNumberInt - i).toString(16),
    );
    return blockNumbers;
  }

  public async getTransactionsByBlockNumber(
    blockNumber: string,
  ): Promise<Array<EthereumTransaction>> {
    const params = new URLSearchParams({
      module: 'proxy',
      action: 'eth_getBlockByNumber',
      tag: blockNumber,
      boolean: 'true',
      apiKey: this.options.apiKey,
    });
    const response = await this.makeGetRequest(
      `${EtherscanApiService.etherscanApiUrl}?${params.toString()}`,
    );
    const data = response.data as GetBlockInfoResponse | BadResponse;
    const isBadResponse = this.isBadResponse(data);
    if (isBadResponse) {
      throw new Error(data.result);
    }
    return data.result.transactions;
  }

  private async makeGetRequest(
    url: string,
    maxRetries = 5,
    retryDelay = 0,
  ): Promise<AxiosResponse> {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      const response = await this.http.get(url);
      const data = response.data;

      if (this.isRateLimitResponse(data)) {
        if (attempt < maxRetries - 1) {
          await this.delay(retryDelay);
          continue;
        } else {
          throw new Error('Exceeded max retries due to rate limits.');
        }
      }

      return response;
    }
    throw new Error('makeGetRequest failed after all retries.');
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private isBadResponse(data: any): data is BadResponse {
    return (data as BadResponse).status === '0';
  }

  private isRateLimitResponse(data: any): data is BadResponse {
    return (
      this.isBadResponse(data) &&
      (data as BadResponse).result.includes(
        'Max calls per sec rate limit reached',
      )
    );
  }
}
