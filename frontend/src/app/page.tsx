import { Hero } from "@/components/landing/Hero"
import { Features } from "@/components/landing/Features"
import { CTASection } from "@/components/landing/CTASection"
import { Footer } from "@/components/landing/Footer"

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <Features />
      <CTASection />
      <Footer />
    </main>
  )
}
