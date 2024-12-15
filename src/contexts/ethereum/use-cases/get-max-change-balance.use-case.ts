import { Injectable } from '@nestjs/common';
import { EtherscanApiService } from '../external-api';

export class GetMaxChangeBalanceCommand {
  numberOfBlocks: number;
}

@Injectable()
export class GetMaxChangeBalancesUseCase {
  constructor(private readonly etherscanApiService: EtherscanApiService) {}

  async execute(
    command: GetMaxChangeBalanceCommand,
  ): Promise<Array<{ address: string; changeBalance: string }>> {
    const { numberOfBlocks } = command;
    const addressesAbsChangeBalances = new Map<string, bigint>();

    const lastBlocksNumbers =
      await this.etherscanApiService.getLastBlocksNumbers(numberOfBlocks);
    for (const blockNumber of lastBlocksNumbers) {
      const blockChangeBalances =
        await this.getBlockChangeBalances(blockNumber);
      this.aggregateBlockBalances(
        blockChangeBalances,
        addressesAbsChangeBalances,
      );
    }

    const maxChangeKeyValues = this.findMaxAbsKeyValue(
      addressesAbsChangeBalances,
    );
    return maxChangeKeyValues.map(({ key, value }) => ({
      address: key,
      changeBalance: value.toString(16),
    }));
  }

  private async getBlockChangeBalances(
    blockNumber: string,
  ): Promise<Map<string, bigint>> {
    const blockAbsChangeBalances = new Map<string, bigint>();
    const transactions =
      await this.etherscanApiService.getTransactionsByBlockNumber(blockNumber);

    for (const transaction of transactions) {
      const { from, to, value } = transaction;
      const valueInt = BigInt(value);

      this.updateBalance(blockAbsChangeBalances, from, -valueInt);
      this.updateBalance(blockAbsChangeBalances, to, valueInt);
    }

    this.removeZeroBalances(blockAbsChangeBalances);
    return blockAbsChangeBalances;
  }

  private updateBalance(
    balanceMap: Map<string, bigint>,
    address: string,
    value: bigint,
  ): void {
    if (!address) return;
    const currentBalance = balanceMap.get(address) ?? BigInt(0);
    balanceMap.set(address, currentBalance + value);
  }

  private removeZeroBalances(balanceMap: Map<string, bigint>): void {
    for (const [address, balance] of balanceMap) {
      if (balance === BigInt(0)) {
        balanceMap.delete(address);
      }
    }
  }

  private aggregateBlockBalances(
    source: Map<string, bigint>,
    target: Map<string, bigint>,
  ): void {
    for (const [address, changeBalance] of source) {
      const currentBalance = target.get(address) ?? BigInt(0);
      target.set(address, currentBalance + changeBalance);
    }
  }

  private findMaxAbsKeyValue(map: Map<string, bigint>): Array<{ key: string; value: bigint }> {
    let maxAbsValue = BigInt(0);
    const result: Array<{ key: string; value: bigint }> = [];

    for (const [key, value] of map) {
      const absValue = value >= 0 ? value : -value;

      if (absValue > maxAbsValue) {
        maxAbsValue = absValue;
        result.length = 0;
        result.push({ key, value });
      } else if (absValue === maxAbsValue) {
        result.push({ key, value });
      }
    }

    return result;
  }
}
