export const yieldVaultAbi = [
  {
    "type": "function",
    "name": "deposit",
    "inputs": [
      {
        "name": "amount",
        "type": "uint256"
      }
    ],
    "outputs": []
  },
  {
    "type": "function",
    "name": "withdraw",
    "inputs": [
      {
        "name": "amount",
        "type": "uint256"
      }
    ],
    "outputs": []
  },
  {
    "type": "function",
    "name": "rebalance",
    "inputs": [],
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
    "name": "get_user_balance",
    "inputs": [
      {
        "name": "user",
        "type": "felt"
      }
    ],
    "outputs": [
      {
        "name": "balance",
        "type": "uint256"
      }
    ]
  },
  {
    "type": "function",
    "name": "get_total_deposits",
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
    "name": "get_current_allocation",
    "inputs": [],
    "outputs": [
      {
        "name": "vesu_allocation",
        "type": "uint256"
      },
      {
        "name": "babylon_allocation",
        "type": "uint256"
      },
      {
        "name": "ekubo_allocation",
        "type": "uint256"
      }
    ]
  }
];
