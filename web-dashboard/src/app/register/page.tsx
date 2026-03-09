"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Building2, ArrowRight } from "lucide-react"
import Link from "next/link"
import { signIn } from "next-auth/react"

export default function RegisterPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess(false)

    const formData = new FormData(e.currentTarget)
    const firstName = formData.get("firstName")
    const lastName = formData.get("lastName")
    const email = formData.get("email")
    const phone = formData.get("phone")
    const password = formData.get("password")
    const role = formData.get("role")

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${firstName} ${lastName}`,
          email,
          phone,
          password,
          role
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Registration failed")
      }

      setSuccess(true)
      setTimeout(() => {
        window.location.href = "/login"
      }, 2000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-50 relative py-12 px-6 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-orange-500/10 blur-[150px] -z-10 rounded-full" />
      <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-blue-500/10 blur-[150px] -z-10 rounded-full" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-xl p-8 backdrop-blur-xl bg-slate-900/60 border border-white/10 rounded-3xl shadow-2xl"
      >
        <Link href="/" className="inline-flex items-center gap-2 mb-8 hover:opacity-80 transition-opacity">
          <Building2 className="w-8 h-8 text-orange-500" />
          <span className="text-2xl font-bold tracking-tight">BuildCore<span className="text-orange-500">.</span></span>
        </Link>

        <h1 className="text-3xl font-bold mb-2">Request Access</h1>
        <p className="text-slate-400 mb-8">System registration requires Admin approval.</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm">{error}</div>}
          {success && <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl text-sm">Registration successful! Redirecting to login...</div>}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
             <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">First Name</label>
              <input 
                name="firstName" type="text" required
                className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all placeholder:text-slate-600"
                placeholder="John"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Last Name</label>
              <input 
                name="lastName" type="text" required
                className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all placeholder:text-slate-600"
                placeholder="Doe"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Email Address (Optional)</label>
              <input 
                name="email" type="email"
                className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all placeholder:text-slate-600"
                placeholder="worker@company.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Phone Number</label>
              <input 
                name="phone" type="tel"
                className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all placeholder:text-slate-600"
                placeholder="+1234567890"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Password</label>
            <input 
              name="password" type="password" required
              className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all placeholder:text-slate-600"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Requested Role</label>
            <select 
              name="role" required
              className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
            >
              <option value="WORKER">Site Worker</option>
              <option value="OWNER">Company Owner (Initial Setup)</option>
            </select>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-xl font-medium transition-all shadow-[0_0_20px_rgba(249,115,22,0.2)] mt-8"
          >
            {loading ? "Submitting Request..." : "Register Account"}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="mt-8 flex items-center justify-between">
          <span className="w-1/5 border-b border-slate-700 lg:w-1/4"></span>
          <p className="text-xs text-center text-slate-400 uppercase tracking-widest px-2">or continue with</p>
          <span className="w-1/5 border-b border-slate-700 lg:w-1/4"></span>
        </div>
        
        <button
           type="button"
           onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
           className="w-full mt-6 flex items-center justify-center gap-3 px-8 py-3 bg-white hover:bg-slate-50 text-slate-900 rounded-xl font-medium transition-all shadow-sm group"
        >
          <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Google
        </button>

        <p className="mt-8 text-center text-sm text-slate-400">
          Already have an account? <Link href="/login" className="text-orange-400 hover:text-orange-300 font-medium ml-1">Sign in instead</Link>
        </p>
      </motion.div>
    </main>
  )
}
