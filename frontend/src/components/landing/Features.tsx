import { Container } from "@/components/ui/Container"
import { FEATURES } from "@/lib/constants"
import * as Icons from "lucide-react"

export function Features() {
  return (
    <section id="features" className="py-24 lg:py-32 relative">
      <Container>
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-base font-semibold leading-7 text-secondary mb-3 font-heading uppercase tracking-wide animate-fade-up">
            Everything you need
          </h2>
          <p className="text-3xl font-bold tracking-tight text-secondary sm:text-4xl lg:text-5xl font-heading animate-fade-up stagger-1">
            Powerful features to boost your productivity
          </p>
        </div>
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature, index) => {
              // @ts-ignore
              const Icon = Icons[feature.icon] || Icons.Check;
              return (
                <div
                  key={feature.title}
                  className={`relative bg-primary rounded-2xl p-6 flex flex-col h-full hover-lift cursor-pointer group animate-fade-up stagger-${Math.min(index + 2, 6)}`}
                >
                  {/* Hover effect glow */}
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-secondary/5 to-transparent" />

                  <div className="flex items-start gap-4 mb-4 relative z-10">
                    <div className="flex-shrink-0 flex h-12 w-12 items-center justify-center bg-secondary rounded-xl group-hover:scale-110 transition-transform duration-300">
                        <Icon className="h-6 w-6 text-primary" aria-hidden="true" />
                    </div>
                    <h3 className="text-lg font-semibold leading-7 text-secondary font-heading flex-1">
                      {feature.title}
                    </h3>
                  </div>
                  <p className="flex-auto text-base leading-7 text-secondary/80 font-body relative z-10">
                    {feature.description}
                  </p>

                  {/* Arrow indicator on hover */}
                  <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-8 h-8 bg-secondary/10 rounded-full flex items-center justify-center">
                      <Icons.ArrowRight className="h-4 w-4 text-secondary" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  )
}
