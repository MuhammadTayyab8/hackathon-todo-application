"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth"
import { Button } from "@/components/ui/Button"
import { Eye, EyeOff, Loader2, KeyRound, Mail, Lock } from "lucide-react"

/**
 * SignInForm - A high-contrast, modern signin interface.
 * Design: Lime on Onyx with staggered entrance animations.
 */
export default function SignInForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [showPassword, setShowPassword] = React.useState(false)

  const [formData, setFormData] = React.useState({
    email: "",
    password: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const { data, error } = await authClient.signIn.email({
        email: formData.email,
        password: formData.password,
        callbackURL: "/"
      })

      if (error) {
        setError(error.message || "Invalid email or password.")
      } else {
        router.push("/")
      }
    } catch (err) {
      setError("Failed to connect to authentication service.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md animate-fade-up">
      <div className="bg-secondary/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden relative group">
        {/* Decorative corner accent */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 blur-3xl group-hover:bg-primary/20 transition-all duration-700" />

        <div className="relative z-10">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(185,255,102,0.4)] rotate-3 hover:rotate-0 transition-transform duration-500">
              <KeyRound className="w-8 h-8 text-secondary" />
            </div>
            <h1 className="text-3xl font-heading text-white text-center">Welcome Back</h1>
            <p className="text-foreground-light mt-2 text-center text-sm">Sign in to access your dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2 stagger-1">
              <label htmlFor="email" className="text-sm font-medium text-white/70 ml-1">Email Address</label>
              <div className="relative group/field">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within/field:text-primary transition-colors" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2 stagger-2">
              <div className="flex justify-between items-center ml-1">
                <label htmlFor="password" title="Password requirements below" className="text-sm font-medium text-white/70">Password</label>
                <a href="#" className="text-xs text-primary/60 hover:text-primary transition-colors">Forgot password?</a>
              </div>
              <div className="relative group/field">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within/field:text-primary transition-colors" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-12 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-white/30 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-medium animate-pulse">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-xl text-base font-bold bg-primary text-secondary hover:shadow-[0_0_25px_rgba(185,255,102,0.4)] transition-all duration-300 stagger-3 shadow-lg"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-white/40 stagger-4">
            Don't have an account?{" "}
            <a href="/signup" className="text-primary hover:underline font-bold transition-all underline-offset-4">
              Create Account
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
