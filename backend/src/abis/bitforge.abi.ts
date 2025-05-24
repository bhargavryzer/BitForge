export const bitforgeAbi = [
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
    "name": "compound_rewards",
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
    "name": "get_current_apy",
    "inputs": [],
    "outputs": [
      {
        "name": "apy",
        "type": "uint256"
      }
    ]
  }
];
