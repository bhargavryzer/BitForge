export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  starknet: {
    rpcUrl: process.env.STARKNET_RPC_URL,
    adminPrivateKey: process.env.ADMIN_PRIVATE_KEY,
    adminAccountAddress: process.env.ADMIN_ACCOUNT_ADDRESS,
  },
  contracts: {
    bitforge: process.env.BITFORGE_CONTRACT_ADDRESS,
    yieldVault: process.env.YIELD_VAULT_CONTRACT_ADDRESS,
    stakingModule: process.env.STAKING_MODULE_CONTRACT_ADDRESS,
    liquidityPool: process.env.LIQUIDITY_POOL_CONTRACT_ADDRESS,
  },
  tokens: {
    btc: process.env.BTC_TOKEN_ADDRESS,
    wbtc: process.env.WBTC_TOKEN_ADDRESS,
    lbtc: process.env.LBTC_TOKEN_ADDRESS,
    strk: process.env.STRK_TOKEN_ADDRESS,
  },
  pragma: {
    apiKey: process.env.PRAGMA_API_KEY,
  },
});
