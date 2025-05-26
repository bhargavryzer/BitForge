"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { useTheme } from "next-themes"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { Button } from "@/components/ui/button"
import { Bitcoin, Menu, X } from "lucide-react"

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState("")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { theme } = useTheme()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)

      // Get all sections
      const sections = ["features", "yield", "how-it-works", "faq"]
      const scrollPosition = window.scrollY + 100

      // Find the current section
      for (const section of sections) {
        const element = document.getElementById(section)
        if (element) {
          const { offsetTop, offsetHeight } = element
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section)
            break
          }
        }
      }
    }
    
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      const offset = 80 // Height of the fixed navbar
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - offset

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      })
    }
    setMobileMenuOpen(false)
  }

  const menuItems = [
    { name: "Features", href: "features" },
    { name: "Yield", href: "yield" },
    { name: "How It Works", href: "how-it-works" },
    { name: "FAQ", href: "faq" }
  ]

  return (
    <>
      <motion.header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? "bg-background/80 backdrop-blur-lg shadow-sm" 
            : "bg-transparent"
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="container mx-auto flex items-center justify-between py-4 px-6">
          <Link href="/" className="flex items-center space-x-2">
            <motion.div
              whileHover={{ rotate: 15 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              className="text-primary"
            >
              <Bitcoin className="h-8 w-8" />
            </motion.div>
            <motion.span 
              className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-orange-600"
              whileHover={{ scale: 1.05 }}
            >
              BitForge
            </motion.span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <nav className="flex items-center space-x-6">
              {menuItems.map((item) => (
                <motion.button
                  key={item.href}
                  onClick={() => scrollToSection(item.href)}
                  className={`relative text-foreground/80 hover:text-primary transition-colors font-medium ${
                    activeSection === item.href ? "text-primary" : ""
                  }`}
                  whileHover={{ scale: 1.05 }}
                >
                  {item.name}
                  {activeSection === item.href && (
                    <motion.div
                      layoutId="activeSection"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500 to-orange-600"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </motion.button>
              ))}
            </nav>
            
            <div className="flex items-center space-x-3">
              <ThemeToggle />
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  onClick={() => scrollToSection("cta")}
                  className="bg-gradient-to-r from-amber-500 to-orange-600 text-white"
                >
                  Join Waitlist
                </Button>
              </motion.div>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center space-x-3 md:hidden">
            <ThemeToggle />
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden bg-background/95 backdrop-blur-lg border-t border-border"
            >
              <nav className="flex flex-col space-y-4 p-6">
                {menuItems.map((item) => (
                  <motion.button
                    key={item.href}
                    onClick={() => scrollToSection(item.href)}
                    className={`text-left text-foreground/80 hover:text-primary transition-colors block py-2 font-medium ${
                      activeSection === item.href ? "text-primary" : ""
                    }`}
                    whileHover={{ x: 10 }}
                  >
                    {item.name}
                  </motion.button>
                ))}
                <Button 
                  onClick={() => scrollToSection("cta")}
                  className="bg-gradient-to-r from-amber-500 to-orange-600 text-white w-full mt-2"
                >
                  Join Waitlist
                </Button>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
      {/* Spacer to prevent content from hiding under the navbar */}
      <div className="h-20"></div>
    </>
  )
}