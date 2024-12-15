export interface BadResponse {
  status: string;
  message: string;
  result: string;
}

export interface GetLastBlockResponse {
  jsonrpc: string;
  id: number;
  result: string;
}

export interface EthereumTransaction {
  blockHash: string;
  blockNumber: string;
  from: string;
  gas: string;
  gasPrice: string;
  hash: string;
  input: string;
  nonce: string;
  to: string;
  transactionIndex: string;
  value: string;
  type: string;
  chainId: string;
  v: string;
  r: string;
  s: string;
}

export interface GetBlockInfoResponse {
  jsonrpc: string;
  id: number;
  result: {
    baseFeePerGas: string;
    difficulty: string;
    extraData: string;
    gasLimit: string;
    gasUsed: string;
    hash: string;
    logsBloom: string;
    miner: string;
    mixHash: string;
    nonce: string;
    number: string;
    parentHash: string;
    receiptsRoot: string;
    sha3Uncles: string;
    size: string;
    stateRoot: string;
    timestamp: string;
    totalDifficulty: string;
    transactions: Array<EthereumTransaction>;
    transactionsRoot: string;
    uncles: Array<string>;
  };
}
