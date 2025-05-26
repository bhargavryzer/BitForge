export const features = [
  {
    title: "Dynamic Yield Vault",
    description: "Smart allocation of deposits across Vesu lending markets, Ekubo concentrated liquidity pools, and Babylon staking via LBTC for maximum returns.",
    icon: "LayoutGrid",
    gradient: "from-blue-500 to-purple-600",
    delay: 0.1
  },
  {
    title: "Babylon Staking Integration",
    description: "Earn staking rewards through LBTC alongside lending and liquidity yields for multiplied returns without locking up your BTC.",
    icon: "Link",
    gradient: "from-amber-500 to-orange-600", 
    delay: 0.2
  },
  {
    title: "Concentrated Liquidity",
    description: "Deploy BTC/WBTC in Ekubo pools with concentrated liquidity in tight price ranges for high capital efficiency and auto-compounding.",
    icon: "BarChart3",
    gradient: "from-emerald-500 to-teal-600",
    delay: 0.3
  },
  {
    title: "Intuitive Dashboard",
    description: "Mobile-friendly interface displaying real-time APY, allocation breakdown, projected returns, and staking rewards at a glance.",
    icon: "LayoutDashboard",
    gradient: "from-indigo-500 to-blue-600",
    delay: 0.4
  },
  {
    title: "Gasless Transactions",
    description: "Leveraging Starknet's account abstraction for gasless deposits, withdrawals, and rebalancing operations.",
    icon: "Zap",
    gradient: "from-fuchsia-500 to-purple-600",
    delay: 0.5
  },
  {
    title: "BTC-Only Exposure",
    description: "All yields and rewards automatically converted to BTC/WBTC via Ekubo swaps, maintaining pure Bitcoin exposure.",
    icon: "Bitcoin",
    gradient: "from-amber-400 to-yellow-600",
    delay: 0.6
  }
];

export const apyData = [
  { 
    name: "Vesu Lending", 
    apy: "12-15%", 
    description: "Returns from DeFi Spring and market demand", 
    color: "bg-gradient-to-r from-blue-500 to-blue-600" 
  },
  { 
    name: "Babylon Staking", 
    apy: "5-10%", 
    description: "Estimated staking rewards", 
    color: "bg-gradient-to-r from-amber-400 to-orange-500" 
  },
  { 
    name: "Ekubo Liquidity", 
    apy: "10-20%", 
    description: "Concentrated liquidity fees with auto-compounding", 
    color: "bg-gradient-to-r from-emerald-500 to-teal-600" 
  },
  { 
    name: "Total BitForge", 
    apy: "20-30%", 
    description: "Combined with optimal rebalancing", 
    color: "bg-gradient-to-r from-purple-600 to-indigo-700" 
  }
];

export const testimonials = [
  {
    quote: "BitForge's auto-compounding has completely changed how I manage my BTC holdings. I'm earning yields I never thought possible.",
    name: "Alex Thompson",
    title: "Crypto Investor",
  },
  {
    quote: "The gasless transactions and intuitive dashboard make yield farming accessible even for beginners like me.",
    name: "Sarah Chen",
    title: "Software Developer",
  },
  {
    quote: "I've tried many yield platforms, but BitForge's integrated approach with Starknet makes it the most capital efficient by far.",
    name: "Michael Rivera",
    title: "DeFi Researcher",
  }
];

export const faqItems = [
  {
    question: "What is BitForge?",
    answer: "BitForge is a comprehensive BTC yield platform built on Starknet that integrates dynamic yield optimization, Babylon staking via Lombard's LBTC, and concentrated liquidity provision with auto-compounding to maximize returns on your Bitcoin.",
  },
  {
    question: "How does BitForge generate yield?",
    answer: "BitForge deploys your BTC across three yield sources: Vesu lending markets (12-15% APR), Babylon staking via LBTC (5-10% APR), and Ekubo concentrated liquidity pools (10-20% APR) - all combined for a potential 20-30% APR with optimal rebalancing.",
  },
  {
    question: "Is my Bitcoin safe on BitForge?",
    answer: "BitForge employs multiple security measures including audited smart contracts, secure multi-sig operations, and transparent risk management. We maintain pure BTC exposure throughout all yield-generating activities.",
  },
  {
    question: "What are the fees for using BitForge?",
    answer: "BitForge charges a performance fee of 10% on generated yields. There are no deposit or withdrawal fees, and all gas costs are covered through our gasless transaction system.",
  },
  {
    question: "When will BitForge launch?",
    answer: "BitForge is currently in closed beta. Join our waitlist to be among the first to access the platform when we launch publicly in Q3 2025.",
  }
];