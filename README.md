# BitForge

BitForge is a comprehensive BTC yield platform on Starknet that integrates dynamic yield optimization, Babylon staking via Lombard's LBTC, and concentrated liquidity provision with auto-compounding.

## Key Features

- **Dynamic Yield Vault**: Allocates deposits across Vesu lending markets, Ekubo concentrated liquidity pools, and Babylon staking via LBTC.
- **Babylon Staking Integration**: Supports LBTC for staking on Babylon, earning staking rewards alongside lending and liquidity yields.
- **Concentrated Liquidity with Auto-Compounding**: Deploys a BTC/WBTC pool on Ekubo with concentrated liquidity in tight price ranges for high capital efficiency.
- **Intuitive Dashboard**: Mobile-friendly React interface displaying real-time APY, allocation breakdown, projected returns, and staking rewards.
- **Gasless Transactions**: Utilizes Starknet's account abstraction for gasless deposits, withdrawals, and rebalancing.
- **BTC-Only Exposure**: Ensures all yields and rewards are converted to BTC/WBTC via Ekubo swaps.

## APY Potential

- Vesu Lending: 12–15% APR from DeFi Spring and market demand.
- Babylon Staking: 5–10% APR (estimated).
- Ekubo Liquidity: 10–20% APR from concentrated liquidity fees, boosted by auto-compounding and STRK rewards.
- Total APY: Potentially 20–30% APR with rebalancing.

## Technical Implementation

- **Smart Contracts (Cairo)**: Yield Vault, Staking Module, Liquidity Pool
- **Frontend**: React with Tailwind CSS
- **Backend**: NestJS

## Getting Started

### Prerequisites

- Node.js (v16+)
- Starknet CLI
- Cairo 1.0
- Scarb (Cairo package manager)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/bitforge.git
cd bitforge

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

### Running the Application

```bash
# Start the backend
cd backend
npm run start:dev

# Start the frontend
cd frontend
npm start
```

## Smart Contract Deployment

```bash
# Compile Cairo contracts
cd contracts
scarb build

# Deploy to Starknet Sepolia testnet
starknet deploy --network sepolia --class_hash <CLASS_HASH>
```

## License

MIT
