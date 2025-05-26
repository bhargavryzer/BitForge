"use client"

import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { features } from "@/lib/constants"
import { fadeIn, staggerContainer } from "@/lib/animations"
import { cn } from "@/lib/utils"
import { 
  LayoutGrid, 
  Link, 
  BarChart3, 
  LayoutDashboard, 
  Zap, 
  Bitcoin 
} from "lucide-react"

export function FeaturesSection() {
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true
  })

  const iconComponents: Record<string, React.ReactNode> = {
    LayoutGrid: <LayoutGrid className="h-8 w-8" />,
    Link: <Link className="h-8 w-8" />,
    BarChart3: <BarChart3 className="h-8 w-8" />,
    LayoutDashboard: <LayoutDashboard className="h-8 w-8" />,
    Zap: <Zap className="h-8 w-8" />,
    Bitcoin: <Bitcoin className="h-8 w-8" />
  }

  return (
    <section id="features" ref={ref} className="py-20 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_30%,hsl(var(--chart-5)/20%),transparent_60%)]"></div>
        <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_70%,hsl(var(--chart-2)/20%),transparent_50%)]"></div>
      </div>
      
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate={inView ? "show" : "hidden"}
        className="container mx-auto px-4 relative z-10"
      >
        <motion.div variants={fadeIn("up", 0.1)} className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Forge Your Bitcoin's Potential</h2>
          <p className="text-lg text-foreground/80 max-w-2xl mx-auto">
            Our comprehensive platform combines multiple yield sources to maximize returns while maintaining pure BTC exposure.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={fadeIn("up", feature.delay)}
              className="bg-card/50 backdrop-blur-sm border border-border/40 rounded-xl overflow-hidden group"
            >
              <div className="p-8">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  className={cn(
                    "w-14 h-14 rounded-lg flex items-center justify-center mb-6 text-white",
                    `bg-gradient-to-r ${feature.gradient}`
                  )}
                >
                  {iconComponents[feature.icon]}
                </motion.div>
                <h3 className="text-xl font-semibold mb-3 group-hover:bg-clip-text group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-amber-500 group-hover:to-orange-600 transition-all duration-300">
                  {feature.title}
                </h3>
                <p className="text-foreground/70 leading-relaxed">
                  {feature.description}
                </p>
              </div>
              <div className="h-2 w-full bg-gradient-to-r group-hover:opacity-100 opacity-0 transition-opacity duration-300 ${feature.gradient}"></div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  )
}