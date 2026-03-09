"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import { User, Lock, Save, AlertCircle, CheckCircle2 } from "lucide-react"

export default function SettingsPage() {
  const { data: session, update } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<{ type: "success" | "error", message: string } | null>(null)

  const [formData, setFormData] = useState({
    name: session?.user?.name || "",
    email: session?.user?.email || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setStatus(null)

    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      setStatus({ type: "error", message: "New passwords do not match" })
      setIsLoading(false)
      return
    }

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile")
      }

      setStatus({ type: "success", message: "Profile updated successfully" })
      
      // Clear password fields on success
      setFormData(prev => ({ ...prev, currentPassword: "", newPassword: "", confirmPassword: "" }))
      
      // Update next-auth session
      await update({
        ...session,
        user: {
          ...session?.user,
          name: formData.name,
          email: formData.email
        }
      })

    } catch (error: unknown) {
      if (error instanceof Error) {
        setStatus({ type: "error", message: error.message })
      } else {
        setStatus({ type: "error", message: "An unknown error occurred" })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Account Settings</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage your profile information and password</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm"
          >
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-500/20 text-orange-600 flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Profile Details</h2>
                <p className="text-xs text-slate-500">Update your personal information</p>
              </div>
            </div>

            <div className="p-6">
              {status && (
                <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 text-sm font-medium ${
                  status.type === 'error' 
                    ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400' 
                    : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
                }`}>
                  {status.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                  {status.message}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-orange-500/50 outline-none transition-all dark:text-white"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-orange-500/50 outline-none transition-all dark:text-white"
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2 mb-4">
                    <Lock className="w-4 h-4 text-slate-400" />
                    <h3 className="text-sm font-semibold">Change Password</h3>
                  </div>
                  
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Current Password</label>
                      <input
                        type="password"
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleChange}
                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-orange-500/50 outline-none transition-all dark:text-white"
                        placeholder="Leave blank to keep current"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">New Password</label>
                        <input
                          type="password"
                          name="newPassword"
                          value={formData.newPassword}
                          onChange={handleChange}
                          className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-orange-500/50 outline-none transition-all dark:text-white"
                          placeholder="New secure password"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Confirm Password</label>
                        <input
                          type="password"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-orange-500/50 outline-none transition-all dark:text-white"
                          placeholder="Confirm new password"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium transition-colors shadow-sm disabled:opacity-70"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {isLoading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>

        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-6"
          >
            <div className="h-16 w-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl shadow-lg flex items-center justify-center text-white mb-4">
              <User className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              {session?.user?.name || "User Profile"}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mb-4">{session?.user?.email}</p>
            <div className="inline-flex px-3 py-1 bg-white dark:bg-slate-900 rounded-full text-xs font-bold text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-500/30">
              Role: {session?.user?.role}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
