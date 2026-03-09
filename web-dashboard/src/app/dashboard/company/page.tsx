"use client"

import { useState, useEffect } from "react"
import { Building2, Save, Loader2 } from "lucide-react"

export default function CompanyProfilePage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    tradeLicense: "",
    registrationNumber: "",
    address: "",
    contactPhone: "",
    contactEmail: ""
  })
  const [message, setMessage] = useState({ type: "", text: "" })

  useEffect(() => {
    fetch("/api/company")
      .then(res => res.json())
      .then(data => {
        if (data && data.name) {
          setFormData({
            name: data.name || "",
            tradeLicense: data.tradeLicense || "",
            registrationNumber: data.registrationNumber || "",
            address: data.address || "",
            contactPhone: data.contactPhone || "",
            contactEmail: data.contactEmail || ""
          })
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage({ type: "", text: "" })

    try {
      const res = await fetch("/api/company", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        setMessage({ type: "success", text: "Company profile updated successfully." })
      } else {
        setMessage({ type: "error", text: "Failed to update company profile." })
      }
    } catch (err) {
      setMessage({ type: "error", text: "An error occurred while saving." })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-[50vh]"><Loader2 className="w-8 h-8 animate-spin text-orange-500" /></div>
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Company Profile</h1>
      </div>

      <div className="bg-white dark:bg-slate-950 rounded-3xl p-8 border border-slate-200 dark:border-white/10 shadow-sm relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl -z-10" />

        <div className="flex items-start gap-4 mb-8">
          <div className="h-16 w-16 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl flex items-center justify-center text-slate-400">
             <Building2 className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Corporate Information</h2>
            <p className="text-slate-500 text-sm mt-1">Manage physical address, legal identifiers, and contact data.</p>
          </div>
        </div>

        {message.text && (
          <div className={`p-4 rounded-xl mb-6 text-sm font-medium ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20' : 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400 border border-red-200 dark:border-red-500/20'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Company Name</label>
              <input 
                type="text" required
                value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-orange-500/50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Trade License Number</label>
              <input 
                type="text" required
                value={formData.tradeLicense} onChange={e => setFormData({...formData, tradeLicense: e.target.value})}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-orange-500/50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Registration Number</label>
              <input 
                type="text" required
                value={formData.registrationNumber} onChange={e => setFormData({...formData, registrationNumber: e.target.value})}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-orange-500/50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Contact Phone</label>
              <input 
                type="text" 
                value={formData.contactPhone} onChange={e => setFormData({...formData, contactPhone: e.target.value})}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-orange-500/50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Contact Email</label>
              <input 
                type="email" 
                value={formData.contactEmail} onChange={e => setFormData({...formData, contactEmail: e.target.value})}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-orange-500/50"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Headquarters Address</label>
              <textarea 
                required rows={3}
                value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-orange-500/50 resize-none"
              ></textarea>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-200 dark:border-white/10 flex justify-end">
            <button 
              type="submit" disabled={saving}
              className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-xl shadow-sm flex items-center gap-2 transition disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
