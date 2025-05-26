import { Bitcoin, Github, Twitter } from "lucide-react"
import Link from "next/link"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-muted/30 border-t border-border/40 pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <Bitcoin className="h-6 w-6 text-amber-500" />
              <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-orange-600">
                BitForge
              </span>
            </div>
            <p className="text-sm text-foreground/70 mb-4">
              Maximizing your Bitcoin yield through dynamic optimization, Babylon staking, and concentrated liquidity.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-foreground/60 hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-foreground/60 hover:text-primary transition-colors">
                <Github className="h-5 w-5" />
              </Link>
            </div>
          </div>

          <div className="col-span-1">
            <h4 className="font-medium mb-4">Platform</h4>
            <ul className="space-y-2">
              <li><Link href="#features" className="text-foreground/70 hover:text-primary transition-colors text-sm">Features</Link></li>
              <li><Link href="#yield" className="text-foreground/70 hover:text-primary transition-colors text-sm">Yield</Link></li>
              <li><Link href="#how-it-works" className="text-foreground/70 hover:text-primary transition-colors text-sm">How it Works</Link></li>
              <li><Link href="#" className="text-foreground/70 hover:text-primary transition-colors text-sm">Roadmap</Link></li>
            </ul>
          </div>

          <div className="col-span-1">
            <h4 className="font-medium mb-4">Resources</h4>
            <ul className="space-y-2">
              <li><Link href="#faq" className="text-foreground/70 hover:text-primary transition-colors text-sm">FAQ</Link></li>
              <li><Link href="#" className="text-foreground/70 hover:text-primary transition-colors text-sm">Documentation</Link></li>
              <li><Link href="#" className="text-foreground/70 hover:text-primary transition-colors text-sm">Security</Link></li>
              <li><Link href="#" className="text-foreground/70 hover:text-primary transition-colors text-sm">Blog</Link></li>
            </ul>
          </div>

          <div className="col-span-1">
            <h4 className="font-medium mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><Link href="#" className="text-foreground/70 hover:text-primary transition-colors text-sm">Terms of Service</Link></li>
              <li><Link href="#" className="text-foreground/70 hover:text-primary transition-colors text-sm">Privacy Policy</Link></li>
              <li><Link href="#" className="text-foreground/70 hover:text-primary transition-colors text-sm">Risk Disclosure</Link></li>
              <li><Link href="#" className="text-foreground/70 hover:text-primary transition-colors text-sm">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/40 pt-8 text-center text-sm text-foreground/60">
          <p>© {currentYear} BitForge. All rights reserved.</p>
          <p className="mt-2">
            BitForge is currently in development. This is not financial advice.
          </p>
        </div>
      </div>
    </footer>
  )
}