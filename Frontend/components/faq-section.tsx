"use client"

import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { faqItems } from "@/lib/constants"
import { fadeIn, staggerContainer } from "@/lib/animations"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { HelpCircle } from "lucide-react"

export function FaqSection() {
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true
  })

  return (
    <section id="faq" ref={ref} className="py-20 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_10%,hsl(var(--chart-3)/10%),transparent_40%)]"></div>
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
            <HelpCircle className="h-6 w-6 text-primary" />
            <h2 className="text-3xl md:text-4xl font-bold">Frequently Asked Questions</h2>
          </div>
          <p className="text-lg text-foreground/80 max-w-2xl mx-auto">
            Everything you need to know about BitForge and how it can help maximize your Bitcoin returns
          </p>
        </motion.div>

        <motion.div
          variants={fadeIn("up", 0.2)}
          className="max-w-3xl mx-auto"
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqItems.map((item, index) => (
              <motion.div
                key={index}
                variants={fadeIn("up", 0.1 * (index + 3))}
              >
                <AccordionItem value={`item-${index}`} className="bg-card/50 backdrop-blur-sm border border-border/40 rounded-lg overflow-hidden">
                  <AccordionTrigger className="px-6 py-4 hover:bg-muted/30 transition-colors text-left">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="px-6 py-4 text-foreground/80">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </motion.div>

        <motion.div
          variants={fadeIn("up", 0.8)}
          className="mt-16 text-center"
        >
          <p className="text-foreground/70 mb-2">
            Still have questions?
          </p>
          <a 
            href="#" 
            className="inline-flex font-medium text-primary hover:text-primary/80 transition-colors"
          >
            Contact our support team
          </a>
        </motion.div>
      </motion.div>
    </section>
  )
}