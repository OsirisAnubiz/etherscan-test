import type { EtherscanApiService } from '../external-api';

import { GetMaxChangeBalancesUseCase } from './get-max-change-balance.use-case';
import { GetMaxChangeBalanceCommand } from './get-max-change-balance.use-case'

describe('GetMaxChangeBalanceUseCase', () => {
  let useCase: GetMaxChangeBalancesUseCase;
  let etherscanApiService: EtherscanApiService;

  const mockEtherscanApiService = {
    getLastBlocksNumbers: jest.fn(),
    getTransactionsByBlockNumber: jest.fn(),
  };

  beforeEach(() => {
    etherscanApiService = mockEtherscanApiService as unknown as EtherscanApiService;
    useCase = new GetMaxChangeBalancesUseCase(etherscanApiService);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should return the address with the maximum balance change', async () => {
    const command = new GetMaxChangeBalanceCommand();
    command.numberOfBlocks = 2;

    mockEtherscanApiService.getLastBlocksNumbers.mockResolvedValue(['1234', '1235']);
    mockEtherscanApiService.getTransactionsByBlockNumber.mockResolvedValueOnce([
      { from: '0xAddress1', to: '0xAddress2', value: '0x' + (1000).toString(16) },
      { from: '0xAddress2', to: '0xAddress3', value: '0x' + (2000).toString(16) },
    ]);
    mockEtherscanApiService.getTransactionsByBlockNumber.mockResolvedValueOnce([
      { from: '0xAddress1', to: '0xAddress3', value: '0x' + (1500).toString(16) },
      { from: '0xAddress3', to: '0xAddress2', value: '0x' + (500).toString(16) },
    ]);

    const result = await useCase.execute(command);

    expect(result).toEqual([{ address: '0xAddress3', changeBalance: (3000).toString(16) }]);
  });

  it('should handle empty block data gracefully', async () => {
    const command = new GetMaxChangeBalanceCommand();
    command.numberOfBlocks = 2;

    mockEtherscanApiService.getLastBlocksNumbers.mockResolvedValue(['1234', '1235']);
    mockEtherscanApiService.getTransactionsByBlockNumber.mockResolvedValueOnce([]);
    mockEtherscanApiService.getTransactionsByBlockNumber.mockResolvedValueOnce([]);

    const result = await useCase.execute(command);

    expect(result).toEqual([]);
  });

  it('should return negative balance change if balance changes negatively', async () => {
    const command = new GetMaxChangeBalanceCommand();
    command.numberOfBlocks = 2;

    mockEtherscanApiService.getLastBlocksNumbers.mockResolvedValue(['1234', '1235']);
    mockEtherscanApiService.getTransactionsByBlockNumber.mockResolvedValueOnce([
      { from: '0xAddress1', to: '0xAddress2', value: '0x' + (1000).toString(16) },
      { from: '0xAddress1', to: '0xAddress3', value: '0x' + (2000).toString(16) },
    ]);
    mockEtherscanApiService.getTransactionsByBlockNumber.mockResolvedValueOnce([
      { from: '0xAddress2', to: '0xAddress3', value: '0x' + (500).toString(16) },
    ]);

    const result = await useCase.execute(command);

    expect(result).toEqual([{ address: '0xAddress1', changeBalance: (-3000).toString(16) }]);
  });

  it('should handle transactions with no value', async () => {
    const command = new GetMaxChangeBalanceCommand();
    command.numberOfBlocks = 2;

    mockEtherscanApiService.getLastBlocksNumbers.mockResolvedValue(['1234', '1235']);
    mockEtherscanApiService.getTransactionsByBlockNumber.mockResolvedValueOnce([
      { from: '0xAddress1', to: '0xAddress2', value: '0x0' },
      { from: '0xAddress2', to: '0xAddress3', value: '0x0' },
    ]);
    mockEtherscanApiService.getTransactionsByBlockNumber.mockResolvedValueOnce([
      { from: '0xAddress1', to: '0xAddress3', value: '0x0' },
      { from: '0xAddress3', to: '0xAddress2', value: '0x0' },
    ]);

    const result = await useCase.execute(command);

    expect(result).toEqual([]);
  });
});
