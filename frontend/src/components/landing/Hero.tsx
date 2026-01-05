import Image from "next/image"
import { Button } from "@/components/ui/Button"
import { Container } from "@/components/ui/Container"

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-16 pb-20 lg:pt-32 lg:pb-32">
      <Container className="relative z-10">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
              Regain control over your <span className="text-primary">daily tasks</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              The most intuitive task management application for high-performance teams and individuals. Stay organized, focused, and productive with Todo App.
            </p>
            <div className="mt-10 flex items-center gap-x-6">
              <Button size="lg">
                Start for Free Today
              </Button>
              <Button variant="ghost" size="lg">
                View Features
              </Button>
            </div>
          </div>
          <div className="relative">
             {/* Dynamic placeholder for LCP optimization */}
            <div className="aspect-[4/3] w-full rounded-2xl bg-muted shadow-2xl overflow-hidden border border-border">
                <div className="flex h-full w-full items-center justify-center bg-accent/30">
                    <span className="text-muted-foreground italic">Product Screenshot Placeholder</span>
                </div>
            </div>
          </div>
        </div>
      </Container>

      {/* Background decorations */}
      <div className="absolute top-0 -z-10 h-full w-full opacity-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-full w-full max-w-7xl blur-3xl">
            <div className="h-[500px] w-[500px] rounded-full bg-primary/30" />
        </div>
      </div>
    </section>
  )
}
