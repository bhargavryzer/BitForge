"use client"

import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { fadeIn, staggerContainer } from "@/lib/animations"
import { Bitcoin, Layers, GitMerge, LineChart, Coins, Repeat } from "lucide-react"
import { cn } from "@/lib/utils"

const steps = [
  {
    title: "Deposit BTC",
    description: "Connect your wallet and deposit BTC to begin earning yield immediately.",
    icon: <Bitcoin className="h-6 w-6" />,
    color: "bg-gradient-to-r from-amber-400 to-amber-600",
  },
  {
    title: "Smart Allocation",
    description: "Your BTC is automatically allocated across multiple yield sources based on current market conditions.",
    icon: <Layers className="h-6 w-6" />,
    color: "bg-gradient-to-r from-blue-500 to-indigo-600",
  },
  {
    title: "Multi-Strategy Deployment",
    description: "Funds are deployed across Vesu lending, Babylon staking via LBTC, and Ekubo liquidity pools.",
    icon: <GitMerge className="h-6 w-6" />,
    color: "bg-gradient-to-r from-emerald-500 to-teal-600",
  },
  {
    title: "Continuous Monitoring",
    description: "Our algorithm continuously monitors market conditions and APY rates across all yield sources.",
    icon: <LineChart className="h-6 w-6" />,
    color: "bg-gradient-to-r from-purple-500 to-fuchsia-600",
  },
  {
    title: "Auto-Compounding",
    description: "Yields are automatically harvested and reinvested to maximize compound returns.",
    icon: <Coins className="h-6 w-6" />,
    color: "bg-gradient-to-r from-amber-500 to-orange-600",
  },
  {
    title: "Dynamic Rebalancing",
    description: "Assets are rebalanced between yield sources to optimize returns as market conditions change.",
    icon: <Repeat className="h-6 w-6" />,
    color: "bg-gradient-to-r from-blue-400 to-blue-600",
  },
]

export function HowItWorks() {
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true
  })

  return (
    <section id="how-it-works" ref={ref} className="py-20 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_10%_20%,hsl(var(--chart-1)/10%),transparent_30%)]"></div>
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_90%_80%,hsl(var(--chart-2)/10%),transparent_30%)]"></div>
      </div>
      
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate={inView ? "show" : "hidden"}
        className="container mx-auto px-4 relative z-10"
      >
        <motion.div 
          variants={fadeIn("up", 0.1)}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How BitForge Works</h2>
          <p className="text-lg text-foreground/80 max-w-2xl mx-auto">
            Our platform seamlessly integrates multiple yield strategies to optimize your Bitcoin returns
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              variants={fadeIn("up", 0.1 * (index + 2))}
              whileHover={{ y: -5 }}
              className="bg-card/50 backdrop-blur-sm border border-border/40 rounded-xl overflow-hidden"
            >
              <div className="p-6 h-full flex flex-col">
                <div className={cn(
                  "w-12 h-12 rounded-lg flex items-center justify-center text-white mb-4",
                  step.color
                )}>
                  {step.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-foreground/70 flex-grow">{step.description}</p>
              </div>
              <motion.div 
                initial={{ width: "0%" }}
                whileHover={{ width: "100%" }}
                className={cn("h-1", step.color)}
              ></motion.div>
            </motion.div>
          ))}
        </div>

        <motion.div 
          variants={fadeIn("up", 0.8)}
          className="mt-20 max-w-4xl mx-auto bg-card/50 backdrop-blur-sm border border-border/40 rounded-xl p-8 relative overflow-hidden"
        >
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-b from-blue-500/10 to-indigo-600/10 rounded-full blur-3xl"></div>
          
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-2">Starknet Advantage</h3>
            <p className="text-foreground/70">
              BitForge leverages Starknet's advanced features to provide a superior yield experience
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-muted/30 p-5 rounded-lg">
              <h4 className="font-medium mb-2">⚡ Low Transaction Costs</h4>
              <p className="text-sm text-foreground/70">
                Starknet's Layer 2 scaling solution reduces gas fees to near-zero, making frequent rebalancing economically viable.
              </p>
            </div>
            <div className="bg-muted/30 p-5 rounded-lg">
              <h4 className="font-medium mb-2">🔒 Enhanced Security</h4>
              <p className="text-sm text-foreground/70">
                STARK proofs provide mathematical guarantees of transaction validity and security.
              </p>
            </div>
            <div className="bg-muted/30 p-5 rounded-lg">
              <h4 className="font-medium mb-2">⚙️ Account Abstraction</h4>
              <p className="text-sm text-foreground/70">
                Enables gasless transactions and advanced programmable accounts for better UX.
              </p>
            </div>
            <div className="bg-muted/30 p-5 rounded-lg">
              <h4 className="font-medium mb-2">🚀 Composability</h4>
              <p className="text-sm text-foreground/70">
                Seamless integration with Starknet DeFi protocols enables more complex yield strategies.
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}