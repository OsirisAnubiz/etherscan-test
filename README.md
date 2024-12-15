## Run

1. Pass the environment variable `ETHERSCAN_API_KEY` in the `config/.dev.env` file
2. Run command `docker compose up` 

## Usage

```bash
curl localhost:3000/ethereum/address/max-change-balance
```

## Run Test

```bash
npm run test
```

## Some Suggestions for improvements
1. Add caching of wallet balance changes for older blocks
2. Externalize the retry count and delay before retries into configuration parameters
