export const stakingModuleAbi = [
  {
    "type": "function",
    "name": "stake",
    "inputs": [
      {
        "name": "btc_amount",
        "type": "uint256"
      }
    ],
    "outputs": []
  },
  {
    "type": "function",
    "name": "unstake",
    "inputs": [
      {
        "name": "lbtc_amount",
        "type": "uint256"
      }
    ],
    "outputs": []
  },
  {
    "type": "function",
    "name": "harvest_rewards",
    "inputs": [],
    "outputs": []
  },
  {
    "type": "function",
    "name": "get_total_staked",
    "inputs": [],
    "outputs": [
      {
        "name": "total",
        "type": "uint256"
      }
    ]
  },
  {
    "type": "function",
    "name": "get_estimated_apy",
    "inputs": [],
    "outputs": [
      {
        "name": "apy",
        "type": "uint256"
      }
    ]
  }
];
