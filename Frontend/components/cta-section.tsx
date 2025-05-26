"use client"

import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { fadeIn } from "@/lib/animations"
import { Bitcoin, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function CtaSection() {
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true
  })

  return (
    <section id="cta" ref={ref} className="py-20 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0">
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-gradient-to-tr from-amber-500/20 to-orange-600/20 rounded-full blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          variants={fadeIn("up", 0.1)}
          className="max-w-4xl mx-auto bg-card border border-border/40 rounded-2xl overflow-hidden shadow-xl"
        >
          <div className="grid grid-cols-1 lg:grid-cols-5">
            <div className="p-8 lg:p-10 lg:col-span-3">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Ready to maximize your Bitcoin yield?
              </h2>
              <p className="text-foreground/70 mb-8">
                Join the BitForge waitlist to be the first to access our platform when we launch. 
                Early users will receive special benefits and reduced performance fees.
              </p>
              
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Input 
                    type="email" 
                    placeholder="Enter your email address" 
                    className="flex-1"
                  />
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button className="bg-gradient-to-r from-amber-500 to-orange-600 text-white min-w-[140px]">
                      Join Waitlist <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </motion.div>
                </div>
                <p className="text-sm text-foreground/60">
                  By joining, you'll receive updates about our launch and early access opportunities.
                </p>
                
                <div className="flex flex-col sm:flex-row items-center gap-3 mt-8 border-t border-border/40 pt-4">
                  <div className="flex -space-x-2">
                    {[...Array(5)].map((_, i) => (
                      <div 
                        key={i} 
                        className="w-8 h-8 rounded-full bg-muted/60 border border-border flex items-center justify-center text-xs font-medium"
                      >
                        {String.fromCharCode(65 + i)}
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-foreground/70">
                    Join <span className="font-medium">500+ users</span> already on the waitlist
                  </p>
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-2 bg-gradient-to-br from-amber-500/10 to-orange-600/10 p-8 flex items-center justify-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-b from-amber-500/20 to-orange-600/20 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-gradient-to-t from-amber-500/10 to-orange-600/10 rounded-full blur-3xl"></div>
              
              <motion.div 
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 opacity-5"
              >
                <div className="w-full h-full bg-[repeating-radial-gradient(circle_at_center,transparent,transparent_2px,currentColor_2px,currentColor_3px)]"></div>
              </motion.div>
              
              <motion.div
                initial="hidden"
                animate={inView ? "show" : "hidden"}
                variants={fadeIn("up", 0.3)}
                className="text-center relative z-10"
              >
                <motion.div 
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-amber-400 to-orange-600 rounded-full flex items-center justify-center"
                >
                  <Bitcoin className="h-10 w-10 text-white" />
                </motion.div>
                <h3 className="text-xl font-bold mb-2">Launch Bonus</h3>
                <p className="text-foreground/80">
                  Early waitlist members get <span className="font-semibold">50% off</span> performance fees for 6 months
                </p>
                
                <div className="mt-6 p-3 bg-background/30 backdrop-blur-sm rounded-lg inline-block">
                  <div className="text-sm font-medium">Limited spots available</div>
                  <div className="w-full h-2 bg-background/50 rounded-full mt-2">
                    <motion.div 
                      initial={{ width: "0%" }}
                      animate={{ width: "70%" }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="h-full bg-gradient-to-r from-amber-400 to-orange-600 rounded-full"
                    />
                  </div>
                  <div className="text-xs mt-1 text-foreground/70">352/500 claimed</div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}