import { Container } from "@/components/ui/Container"
import { Button } from "@/components/ui/Button"

export function CTASection() {
  return (
    <section className="py-24 lg:py-32">
      <Container>
        <div className="relative isolate overflow-hidden bg-foreground px-6 py-24 text-center shadow-2xl rounded-3xl sm:px-16">
          <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to master your workflow?
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-neutral-300">
            Join thousands of users who have already simplified their daily lives with Todo App. Start for free today.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button size="lg" className="bg-white text-foreground hover:bg-white/90">
              Get Started for Free
            </Button>
            <Button variant="link" size="lg" className="text-white hover:text-white/80">
              Learn More <span aria-hidden="true">→</span>
            </Button>
          </div>
          {/* Subtle background decoration */}
          <svg
            viewBox="0 0 1024 1024"
            className="absolute left-1/2 top-1/2 -z-10 h-[64rem] w-[64rem] -translate-x-1/2 [mask-image:radial-gradient(closest-side,white,transparent)]"
            aria-hidden="true"
          >
            <circle cx="512" cy="512" r="512" fill="url(#gradient)" fillOpacity="0.2" />
            <defs>
              <radialGradient id="gradient">
                <stop stopColor="white" />
                <stop offset={1} stopColor="#ffffff" />
              </radialGradient>
            </defs>
          </svg>
        </div>
      </Container>
    </section>
  )
}
