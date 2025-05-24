export const liquidityPoolAbi = [
  {
    "type": "function",
    "name": "add_liquidity",
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
    "name": "remove_liquidity",
    "inputs": [
      {
        "name": "liquidity_amount",
        "type": "uint256"
      }
    ],
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
    "name": "update_fee_tier",
    "inputs": [],
    "outputs": []
  },
  {
    "type": "function",
    "name": "update_price_range",
    "inputs": [],
    "outputs": []
  },
  {
    "type": "function",
    "name": "get_total_liquidity",
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
    "name": "get_current_fee_tier",
    "inputs": [],
    "outputs": [
      {
        "name": "fee",
        "type": "uint256"
      }
    ]
  },
  {
    "type": "function",
    "name": "get_price_range",
    "inputs": [],
    "outputs": [
      {
        "name": "lower_tick",
        "type": "int32"
      },
      {
        "name": "upper_tick",
        "type": "int32"
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
