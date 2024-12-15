import { Controller } from '@nestjs/common';
import { Get } from '@nestjs/common';

import { EtherscanApiService } from '../external-api';
import { GetMaxChangeBalancesUseCase } from '../use-cases';

@Controller('ethereum')
export class EthereumController {
  constructor(
    private readonly getMaxChangeBalancesUseCase: GetMaxChangeBalancesUseCase,
  ) {}

  @Get('/address/max-change-balance')
  async getGreatestChangeBalance(): Promise<Array<{
    address: string;
    changeBalance: string;
  }>> {
    return await this.getMaxChangeBalancesUseCase.execute({
      numberOfBlocks: 100,
    });
  }
}
