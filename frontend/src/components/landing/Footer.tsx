import { Container } from "@/components/ui/Container"
import Link from "next/link"
import { Twitter, Linkedin, Github } from "lucide-react"

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-secondary py-16 mt-auto">
      <Container>
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4 mb-12">
          <div className="col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center hover:scale-110 transition-transform duration-300">
                <span className="text-secondary font-bold">T</span>
              </div>
              <span className="text-xl font-bold text-tertiary font-heading">Todo App</span>
            </div>
            <p className="text-sm text-tertiary/80 max-w-xs font-body">
              Empowering individuals and teams to achieve more through intuitive task management.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-tertiary uppercase tracking-wider mb-4 font-heading">Product</h3>
            <ul className="space-y-3">
              <li><Link href="#features" className="text-sm text-tertiary/80 hover:text-primary transition-colors font-body relative group">
                Features
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
              </Link></li>
              <li><Link href="#" className="text-sm text-tertiary/80 hover:text-primary transition-colors font-body relative group">
                Pricing
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
              </Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-tertiary uppercase tracking-wider mb-4 font-heading">Company</h3>
            <ul className="space-y-3">
              <li><Link href="#" className="text-sm text-tertiary/80 hover:text-primary transition-colors font-body relative group">
                About
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
              </Link></li>
              <li><Link href="#" className="text-sm text-tertiary/80 hover:text-primary transition-colors font-body relative group">
                Careers
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
              </Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-tertiary uppercase tracking-wider mb-4 font-heading">Legal</h3>
            <ul className="space-y-3">
              <li><Link href="#" className="text-sm text-tertiary/80 hover:text-primary transition-colors font-body relative group">
                Privacy Policy
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
              </Link></li>
              <li><Link href="#" className="text-sm text-tertiary/80 hover:text-primary transition-colors font-body relative group">
                Terms of Service
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
              </Link></li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-tertiary/10 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-sm text-tertiary/60 font-body">
            &copy; {currentYear} Todo App. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="#" className="text-tertiary/80 hover:text-primary transition-colors hover:scale-125 duration-300" aria-label="Twitter">
              <Twitter className="h-5 w-5" />
            </Link>
            <Link href="#" className="text-tertiary/80 hover:text-primary transition-colors hover:scale-125 duration-300" aria-label="LinkedIn">
              <Linkedin className="h-5 w-5" />
            </Link>
            <Link href="#" className="text-tertiary/80 hover:text-primary transition-colors hover:scale-125 duration-300" aria-label="GitHub">
              <Github className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  )
}
