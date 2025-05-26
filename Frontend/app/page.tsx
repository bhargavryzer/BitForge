import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { FeaturesSection } from "@/components/features-section"
import { YieldSection } from "@/components/yield-section"
import { HowItWorks } from "@/components/how-it-works"
import { FaqSection } from "@/components/faq-section"
import { CtaSection } from "@/components/cta-section"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <YieldSection />
      <HowItWorks />
      <FaqSection />
      <CtaSection />
      <Footer />
    </main>
  );
}