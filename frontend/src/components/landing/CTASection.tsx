import { Container } from "@/components/ui/Container"
import { Button } from "@/components/ui/Button"
import { Sparkles } from "lucide-react"

export function CTASection() {
  return (
    <section className="py-6 lg:py-6 relative">
      <Container>
        <div className="relative bg-secondary rounded-3xl px-6 py-16 sm:py-24 md:px-12 lg:px-16 text-center overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-full bg-gradient-to-b from-primary/10 via-transparent to-primary/5 blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <div className="inline-block mb-6">
              <div className="flex items-center gap-2 text-primary">
                <Sparkles className="h-5 w-5 animate-pulse" />
                <span className="text-sm font-semibold uppercase tracking-wider">Join 10,000+ users</span>
              </div>
            </div>

            <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-background sm:text-4xl lg:text-5xl font-heading animate-fade-up">
              Ready to master your workflow?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-background/80 font-body animate-fade-up stagger-1">
              Join thousands of users who have already simplified their daily lives with Todo App. Start for free today.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up stagger-2">
              <Button size="lg" className="bg-background text-tertiary hover:bg-background/90 hover-lift shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] dark:shadow-[0_0_40px_-10px_rgba(0,0,0,0.5)]">
                Get Started for Free
              </Button>
              <Button size="lg" className="border-background text-background hover:bg-background/10 hover-lift">
                Learn More <span aria-hidden="true" className="ml-2">→</span>
              </Button>
            </div>
          </div>

          {/* Geometric patterns */}
          <div className="absolute top-8 right-8 w-32 h-32 border border-background/5 rounded-full" />
          <div className="absolute bottom-12 left-12 w-24 h-24 border border-primary/10 rounded-lg rotate-[-12deg]" />
          <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-primary rounded-full animate-ping" style={{ animationDuration: "3s" }} />
          <div className="absolute bottom-1/4 left-1/4 w-3 h-3 bg-background/20 rounded-full" />
        </div>
      </Container>
    </section>
  )
}
