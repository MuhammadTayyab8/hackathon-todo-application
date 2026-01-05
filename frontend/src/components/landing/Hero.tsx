import { Button } from "@/components/ui/Button"
import { Container } from "@/components/ui/Container"

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-6 pb-10 lg:pt-6 lg:pb-4">
      <Container>
        <div className="relative bg-primary rounded-3xl p-8 md:p-10 lg:p-14 overflow-hidden">
          {/* Large decorative circles in background */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-background/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />

          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 relative z-10">
            <div className="max-w-2xl space-y-8">
              <h1 className="text-4xl font-bold tracking-tight text-secondary sm:text-6xl lg:text-7xl font-heading animate-fade-up">
                Regain control over your <span className="bg-secondary text-primary px-3 py-1 inline-block transform -skew-x-[-6deg]">daily tasks</span>
              </h1>
              <p className="mt-6 text-lg leading-8 text-secondary/90 font-body max-w-xl animate-fade-up stagger-1">
                The most intuitive task management application for high-performance teams and individuals. Stay organized, focused, and productive with Todo App.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 animate-fade-up stagger-2">
                <Button size="lg" className="hover-lift">
                  Start for Free Today
                </Button>
                <Button variant="secondary" size="lg" className="hover-lift">
                  View Features
                </Button>
              </div>
            </div>
            <div className="relative animate-fade-up stagger-3">
               {/* Product screenshot with enhanced visual interest */}
              <div className="aspect-[4/3] w-full bg-secondary rounded-2xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] overflow-hidden border-4 border-background/10 hover-lift">
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-secondary to-secondary/80 relative">
                    {/* Grid pattern overlay */}
                    <div className="absolute inset-0 opacity-5" style={{
                      backgroundImage: `linear-gradient(90deg, #B9FF66 1px, transparent 1px), linear-gradient(#B9FF66 1px, transparent 1px)`,
                      backgroundSize: '40px 40px'
                    }} />
                      <div className="text-center space-y-6 p-8 relative z-10">
                        <div className="w-24 h-24 mx-auto bg-primary rounded-2xl flex items-center justify-center shadow-lg transform rotate-[-6deg] hover:rotate-0 transition-transform duration-500">
                          <span className="text-secondary font-bold text-4xl">T</span>
                        </div>
                        <span className="text-background font-heading font-semibold text-xl tracking-wide">App Preview</span>
                      </div>
                  </div>
              </div>
            </div>
          </div>

          {/* Accent elements */}
          <div className="absolute top-8 right-8 w-3 h-3 bg-secondary/30 rounded-full" />
          <div className="absolute top-12 right-16 w-2 h-2 bg-secondary/20 rounded-full" />
          <div className="absolute bottom-16 left-12 w-4 h-4 bg-background/20 rounded-full" />
        </div>
      </Container>
    </section>
  )
}
