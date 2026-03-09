"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Building2, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function ForgotPasswordPage() {
  const [phone, setPhone] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setMessage("")

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Something went wrong")
      } else {
        setMessage("OTP sent securely to your phone number!")
        // Use a slight timeout so the user sees the success message before transition
        setTimeout(() => {
            router.push(`/reset-password?phone=${encodeURIComponent(phone)}`)
        }, 1500)
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row">
      {/* Left Panel - Hero */}
      <div className="hidden md:flex flex-1 relative bg-slate-900 border-r border-white/10 p-12 flex-col justify-between overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.1),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(56,189,248,0.05),transparent_50%)]" />
          <div className="absolute top-0 right-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1541888086425-d81bb19240f5?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-luminosity" />
        </div>
        
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2 text-white">
            <Building2 className="w-8 h-8 text-orange-500" />
            <span className="text-2xl font-bold tracking-tight">BuildCore</span>
          </Link>
        </div>

        <div className="relative z-10 max-w-lg">
           <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700/50 text-slate-300 text-sm mb-6">
              Account Recovery
            </span>
          <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight mb-6">
            Regain access to your <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">worksites.</span>
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed">
            Enter your registered phone number, and we'll send you a One-Time Password to securely reset your credentials.
          </p>
        </div>
      </div>

      {/* Right Panel - Recovery Form */}
      <div className="flex-1 flex flex-col justify-center p-8 sm:p-12 lg:p-24 bg-slate-950 relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-orange-400" />
        
        <div className="max-w-md w-full mx-auto">
          <div className="mb-10 text-center md:text-left">
            <h2 className="text-3xl font-bold text-white mb-3">Forgot Password</h2>
            <p className="text-slate-400">Enter your phone number to proceed.</p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm"
            >
              {error}
            </motion.div>
          )}

          {message && (
             <motion.div 
               initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
               className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-500 text-sm"
             >
               {message}
             </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Phone Number</label>
              <input 
                type="tel" 
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all placeholder:text-slate-600"
                placeholder="+1234567890"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white p-3 rounded-xl font-medium transition-all shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_25px_rgba(249,115,22,0.5)] disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {loading ? "Sending..." : "Send Reset Code"}
              {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-400">
            Remembered your password? <Link href="/login" className="text-orange-400 hover:text-orange-300 font-medium ml-1">Sign in here</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
