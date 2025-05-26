"use client"

import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { apyData } from "@/lib/constants"
import { fadeIn, staggerContainer, slideIn } from "@/lib/animations"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ChevronRight, TrendingUp, Bitcoin } from "lucide-react"

export function YieldSection() {
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true
  })

  return (
    <section id="yield" ref={ref} className="py-20 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-40 left-20 w-72 h-72 bg-amber-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl"></div>
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
          <div className="flex items-center justify-center gap-2 mb-4">
            <TrendingUp className="h-6 w-6 text-amber-500" />
            <h2 className="text-3xl md:text-4xl font-bold">Exceptional Yield Potential</h2>
          </div>
          <p className="text-lg text-foreground/80 max-w-2xl mx-auto">
            BitForge combines multiple yield sources to achieve industry-leading returns 
            on your Bitcoin while maintaining pure BTC exposure.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <motion.div 
            variants={slideIn("left", 0.2)}
            className="bg-card/50 backdrop-blur-sm border border-border/40 rounded-xl p-6"
          >
            <h3 className="text-2xl font-semibold mb-6">APY Breakdown</h3>
            <div className="space-y-8">
              {apyData.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-medium">{item.name}</span>
                      <p className="text-sm text-foreground/70">{item.description}</p>
                    </div>
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-orange-600">
                      {item.apy}
                    </span>
                  </div>
                  <Progress 
                    value={index === 0 ? 70 : index === 1 ? 40 : index === 2 ? 60 : 95} 
                    className={`h-2 ${item.color}`} 
                  />
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div 
            variants={slideIn("right", 0.3)}
            className="flex flex-col justify-between"
          >
            <Card className="mb-4 backdrop-blur-sm bg-card/50 border-border/40">
              <CardHeader>
                <CardTitle>Auto-Compounding</CardTitle>
                <CardDescription>
                  Our smart contracts automatically reinvest your yields to achieve compounding returns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <motion.div 
                    animate={{
                      scale: [1, 1.2, 1],
                      rotateZ: [0, 10, -10, 0]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "loop",
                      ease: "easeInOut",
                    }}
                    className="w-12 h-12 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full flex items-center justify-center"
                  >
                    <span className="text-white font-bold">1x</span>
                  </motion.div>
                  <ChevronRight className="text-foreground/40" />
                  <motion.div 
                    animate={{
                      scale: [1, 1.3, 1],
                      rotateZ: [0, 5, -5, 0]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "loop",
                      ease: "easeInOut",
                      delay: 0.7
                    }}
                    className="w-14 h-14 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full flex items-center justify-center"
                  >
                    <span className="text-white font-bold">1.5x</span>
                  </motion.div>
                  <ChevronRight className="text-foreground/40" />
                  <motion.div 
                    animate={{
                      scale: [1, 1.4, 1],
                      rotateZ: [0, 5, -5, 0]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "loop",
                      ease: "easeInOut",
                      delay: 1.4
                    }}
                    className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center"
                  >
                    <span className="text-white font-bold">2x</span>
                  </motion.div>
                </div>
                <p className="text-foreground/70">
                  BitForge's auto-compounding feature can potentially double your annual returns 
                  compared to non-compounding platforms.
                </p>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm bg-card/50 border-border/40">
              <CardHeader>
                <CardTitle>Dynamic Rebalancing</CardTitle>
                <CardDescription>
                  Optimize your yield through smart allocation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-4">
                  {["Lending", "Staking", "Liquidity"].map((type, i) => (
                    <motion.div
                      key={type}
                      initial={{ width: "33.3%" }}
                      animate={{ 
                        width: [
                          "33.3%", 
                          i === 0 ? "45%" : i === 1 ? "25%" : "30%", 
                          i === 0 ? "30%" : i === 1 ? "40%" : "30%",
                          "33.3%"
                        ]
                      }}
                      transition={{
                        duration: 10,
                        repeat: Infinity,
                        repeatType: "loop"
                      }}
                      className={`h-8 rounded-md flex items-center justify-center text-xs text-white font-medium ${
                        i === 0 
                          ? "bg-gradient-to-r from-blue-500 to-blue-600" 
                          : i === 1 
                            ? "bg-gradient-to-r from-amber-400 to-orange-500" 
                            : "bg-gradient-to-r from-emerald-500 to-teal-600"
                      }`}
                    >
                      {type}
                    </motion.div>
                  ))}
                </div>
                <p className="text-foreground/70">
                  Our AI-powered rebalancing algorithm continuously shifts your assets 
                  between yield sources to optimize returns based on market conditions.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div
          variants={fadeIn("up", 0.4)}
          className="max-w-3xl mx-auto bg-card/50 backdrop-blur-sm border border-border/40 rounded-xl p-8 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-b from-amber-500/20 to-orange-600/20 blur-3xl -z-10"></div>
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold mb-2">Yield Calculator</h3>
            <p className="text-foreground/70">See how your BTC holdings could grow over time</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="col-span-1">
              <label className="block text-sm font-medium mb-2">Initial BTC</label>
              <div className="relative">
                <input 
                  type="text" 
                  defaultValue="1" 
                  className="w-full p-2 rounded-md bg-background border border-border focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  <Bitcoin className="h-4 w-4 text-amber-500" />
                </div>
              </div>
            </div>
            
            <div className="col-span-1">
              <label className="block text-sm font-medium mb-2">APY Rate</label>
              <select className="w-full p-2 rounded-md bg-background border border-border focus:outline-none focus:ring-2 focus:ring-amber-500">
                <option>15%</option>
                <option>20%</option>
                <option selected>25%</option>
                <option>30%</option>
              </select>
            </div>
            
            <div className="col-span-1">
              <label className="block text-sm font-medium mb-2">Time Period</label>
              <select className="w-full p-2 rounded-md bg-background border border-border focus:outline-none focus:ring-2 focus:ring-amber-500">
                <option>6 months</option>
                <option selected>1 year</option>
                <option>3 years</option>
                <option>5 years</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 bg-muted/50 rounded-lg">
            <div className="text-center">
              <p className="text-sm text-foreground/70 mb-1">Initial Investment</p>
              <p className="text-lg font-semibold">1.00 BTC</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-foreground/70 mb-1">Estimated Yield</p>
              <p className="text-lg font-semibold text-amber-500">+0.25 BTC</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-foreground/70 mb-1">Total Value</p>
              <p className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-orange-600">1.25 BTC</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}