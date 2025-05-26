"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { useInView } from "react-intersection-observer"
import { ArrowDown, Bitcoin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { fadeIn, staggerContainer } from "@/lib/animations"

export function HeroSection() {
  const [ref, inView] = useInView({
    threshold: 0.2,
    triggerOnce: true
  })
  
  const [count, setCount] = useState(0)
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCount(prev => {
        if (prev < 28) return prev + 1
        clearInterval(interval)
        return 28
      })
    }, 100)
    
    return () => clearInterval(interval)
  }, [])

  return (
    <section 
      ref={ref} 
      className="relative min-h-[90vh] pt-10 pb-20 flex items-center overflow-hidden"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-background">
        <div className="absolute inset-0 opacity-20 dark:opacity-40">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,hsl(var(--chart-1)/30%),transparent_40%)]"></div>
          <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_80%,hsl(var(--chart-4)/30%),transparent_40%)]"></div>
        </div>
      </div>

      {/* Floating elements */}
      <motion.div 
        className="absolute top-1/4 left-[15%] w-20 h-20 rounded-full bg-gradient-to-r from-amber-400/20 to-amber-600/20 blur-xl"
        animate={{
          y: [0, 15, 0],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      />
      
      <motion.div 
        className="absolute bottom-1/4 right-[15%] w-32 h-32 rounded-full bg-gradient-to-r from-blue-400/20 to-indigo-600/20 blur-xl"
        animate={{
          y: [0, -20, 0],
          opacity: [0.6, 0.9, 0.6],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          repeatType: "reverse",
          delay: 1
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          className="flex flex-col items-center text-center max-w-5xl mx-auto"
        >
          <motion.div
            variants={fadeIn('up', 0.1)}
            className="flex items-center gap-2 mb-6 bg-muted/50 backdrop-blur-sm px-4 py-2 rounded-full"
          >
            <Bitcoin className="h-5 w-5 text-amber-500" />
            <span className="text-sm font-medium">Maximize Your Bitcoin Yield on Starknet</span>
          </motion.div>

          <motion.h1 
            variants={fadeIn('up', 0.2)} 
            className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-amber-500 via-orange-600 to-amber-400 leading-tight"
          >
            Unlock <span className="relative">
              <span className="relative z-10 text-primary">
                {count}%
              </span>
              <span className="absolute bottom-1 left-0 h-3 w-full bg-amber-500/20 -z-10 rounded-full"></span>
            </span> APY on Your Bitcoin
          </motion.h1>
          
          <motion.p 
            variants={fadeIn('up', 0.3)}
            className="text-lg md:text-xl text-foreground/80 mb-10 max-w-3xl"
          >
            BitForge combines dynamic yield optimization, Babylon staking via LBTC, 
            and concentrated liquidity with auto-compounding to maximize your BTC returns.
          </motion.p>

          <motion.div 
            variants={fadeIn('up', 0.4)}
            className="flex flex-col sm:flex-row gap-4 w-full justify-center"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button size="lg" className="bg-gradient-to-r from-amber-500 to-orange-600 text-white min-w-[180px] shadow-lg shadow-amber-500/20">
                Launch App
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button variant="outline" size="lg" className="min-w-[180px]">
                White Paper <ArrowDown className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          </motion.div>

          <motion.div
            variants={fadeIn('up', 0.5)}
            className="mt-20 w-full max-w-4xl"
          >
            <div className="relative w-full aspect-video bg-gradient-to-br from-background via-muted/30 to-background rounded-xl border border-border/50 shadow-2xl overflow-hidden">
              {/* Dashboard preview mockup */}
              <motion.div 
                className="absolute inset-2 rounded-lg border border-border/50 overflow-hidden bg-card"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.8 }}
              >
                <div className="h-8 bg-muted/50 border-b border-border/50 flex items-center px-4">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                </div>
                
                <div className="grid grid-cols-12 gap-4 p-4">
                  <div className="col-span-12 md:col-span-8 h-52 bg-gradient-to-br from-muted/30 to-muted/10 rounded-lg border border-border/50 p-4">
                    <div className="flex justify-between items-center mb-4">
                      <div className="h-6 w-32 bg-muted/50 rounded-md"></div>
                      <div className="h-6 w-24 bg-muted/50 rounded-md"></div>
                    </div>
                    <div className="h-32 bg-muted/20 rounded-md"></div>
                  </div>
                  <div className="col-span-12 md:col-span-4 h-52 flex flex-col gap-4">
                    <div className="flex-1 bg-gradient-to-br from-amber-500/10 to-orange-600/10 rounded-lg border border-border/50 p-4">
                      <div className="h-5 w-24 bg-muted/50 rounded-md mb-2"></div>
                      <div className="h-8 w-full bg-muted/30 rounded-md"></div>
                    </div>
                    <div className="flex-1 bg-gradient-to-br from-blue-500/10 to-indigo-600/10 rounded-lg border border-border/50 p-4">
                      <div className="h-5 w-24 bg-muted/50 rounded-md mb-2"></div>
                      <div className="h-8 w-full bg-muted/30 rounded-md"></div>
                    </div>
                  </div>
                </div>
              </motion.div>
              
              {/* Gradient overlay for dashboard */}
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent"></div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}