"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/Button"
import { Eye, EyeOff, Loader2, Check, X, ShieldCheck, Mail, User, Lock } from "lucide-react"

/**
 * SignUpForm - A high-contrast, modern signup interface.
 * Design: Lime on Onyx with staggered entrance animations.
 */
export default function SignUpForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [showPassword, setShowPassword] = React.useState(false)

  const [formData, setFormData] = React.useState({
    username: "",
    email: "",
    password: "",
  })

  // Complexity states
  const passwordCriteria = {
    length: formData.password.length >= 12,
    capital: /[A-Z]/.test(formData.password),
    number: /[0-9]/.test(formData.password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password),
  }

  const isPasswordValid = Object.values(passwordCriteria).every(Boolean)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isPasswordValid) {
      setError("Please ensure your password meets all requirements.")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const res = await api.post<{ token: string }>("/api/auth/signup", {
        email: formData.email,
        password: formData.password,
        username: formData.username,
      })

      if (res.token) {
        localStorage.setItem("token", res.token)
      }

      router.push("/")
    } catch (err: any) {
      setError(err.message || "An error occurred during sign up.")
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
              <ShieldCheck className="w-8 h-8 text-secondary" />
            </div>
            <h1 className="text-3xl font-heading text-white text-center">Create Account</h1>
            <p className="text-gray-200 mt-2 text-center text-sm">Join the next generation of productivity</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username Field */}
            <div className="space-y-2 stagger-1">
              <label htmlFor="username" className="text-sm font-medium text-white/70 ml-1">Username</label>
              <div className="relative group/field">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within/field:text-primary transition-colors" />
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  placeholder="johndoe"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-2 stagger-2">
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
            <div className="space-y-2 stagger-3">
              <label htmlFor="password" title="Password requirements below" className="text-sm font-medium text-white/70 ml-1">Password</label>
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

            {/* Password Complexity Helper */}
            <div className="grid grid-cols-2 gap-2 mt-1 stagger-4 border border-white/5 bg-white/5 p-3 rounded-xl">
              <div className={`flex items-center gap-2 text-[10px] uppercase tracking-wider font-bold ${passwordCriteria.length ? 'text-primary' : 'text-white/30'}`}>
                {passwordCriteria.length ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                <span>12+ Characters</span>
              </div>
              <div className={`flex items-center gap-2 text-[10px] uppercase tracking-wider font-bold ${passwordCriteria.capital ? 'text-primary' : 'text-white/30'}`}>
                {passwordCriteria.capital ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                <span>Uppercase</span>
              </div>
              <div className={`flex items-center gap-2 text-[10px] uppercase tracking-wider font-bold ${passwordCriteria.number ? 'text-primary' : 'text-white/30'}`}>
                {passwordCriteria.number ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                <span>Number</span>
              </div>
              <div className={`flex items-center gap-2 text-[10px] uppercase tracking-wider font-bold ${passwordCriteria.special ? 'text-primary' : 'text-white/30'}`}>
                {passwordCriteria.special ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                <span>Special Char</span>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-medium animate-pulse">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading || !isPasswordValid}
              className={`w-full h-12 rounded-xl text-base font-bold transition-all duration-300 stagger-5 shadow-lg
                ${isPasswordValid ? 'hover:shadow-[0_0_25px_rgba(185,255,102,0.4)]' : 'bg-white/10 text-white/80'}`}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-white/40 stagger-6">
            Already have an account?{" "}
            <a href="/signin" className="text-primary hover:underline font-bold transition-all underline-offset-4">
              Sign In
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
