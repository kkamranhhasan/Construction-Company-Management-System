"use client"

import { useState, useEffect } from "react"
import { MapPin, Plus, Loader2, HardHat, Briefcase, Edit2, Trash2 } from "lucide-react"

export default function SitesPage() {
  const [sites, setSites] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({ name: "", location: "", isActive: true })

  useEffect(() => {
    fetchSites()
  }, [])

  const fetchSites = async () => {
    try {
      const res = await fetch("/api/sites")
      const data = await res.json()
      setSites(Array.isArray(data) ? data : [])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (editingId) {
        await fetch(`/api/sites/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData)
        })
      } else {
        await fetch("/api/sites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData)
        })
      }
      await fetchSites()
      setFormData({ name: "", location: "", isActive: true })
      setEditingId(null)
      setShowForm(false)
    } catch(err) {
      console.error(err)
      setLoading(false)
    }
  }

  const handleEdit = (site: any) => {
    setFormData({
      name: site.name || "",
      location: site.location || "",
      isActive: site.isActive !== undefined ? site.isActive : true
    })
    setEditingId(site.id)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this site? All associated projects and data might be affected.")) return;
    try {
      await fetch(`/api/sites/${id}`, { method: "DELETE" })
      setSites(sites.filter(s => s.id !== id))
    } catch(err) {
      console.error(err)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Construction Sites</h1>
          <p className="text-slate-500 mt-1">Manage all active and planned project locations.</p>
        </div>
        <button 
          onClick={() => {
            setEditingId(null);
            setFormData({ name: "", location: "", isActive: true });
            setShowForm(!showForm);
          }}
          className="px-4 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-medium flex items-center gap-2 hover:bg-slate-800 dark:hover:bg-slate-100 transition shadow-sm self-start"
        >
          <Plus className="w-4 h-4" /> Create New Site
        </button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm animate-in fade-in slide-in-from-top-4">
          <h3 className="text-lg font-semibold mb-4">{editingId ? "Edit Site Details" : "Add Site Details"}</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Site Name</label>
              <input 
                type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="e.g. Downtown Tower Phase 1"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-orange-500/50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Location</label>
              <input 
                type="text" required value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})}
                placeholder="Address or Coordinates"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-orange-500/50"
              />
            </div>
            {editingId && (
              <div className="space-y-2 md:col-span-2 flex items-center gap-3">
                <input 
                  type="checkbox" id="isActive" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})}
                  className="w-5 h-5 accent-orange-500 rounded focus:ring-orange-500/50"
                />
                <label htmlFor="isActive" className="text-sm font-medium">Site is Active</label>
              </div>
            )}
            <div className="md:col-span-2 pt-2 flex justify-end gap-3">
              <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl font-medium transition">Cancel</button>
              <button type="submit" className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium transition shadow-sm">
                {editingId ? "Save Changes" : "Save Site"}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading && !showForm ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-orange-500" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sites.map(site => (
            <div key={site.id} className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm hover:shadow-md transition-shadow group cursor-pointer relative overflow-hidden">
               <div className={`absolute top-0 right-0 w-32 h-32 ${site.isActive ? 'bg-emerald-500/5' : 'bg-slate-500/5'} blur-2xl rounded-full -z-10`} />
               
               <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-xl ${site.isActive ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'}`}>
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${site.isActive ? 'border-emerald-200 text-emerald-700 bg-emerald-50 dark:border-emerald-500/20 dark:text-emerald-400 dark:bg-emerald-500/10' : 'border-slate-200 text-slate-600 bg-slate-50 dark:border-white/10 dark:text-slate-400 dark:bg-slate-800'}`}>
                      {site.isActive ? "Active" : "Archived"}
                    </span>
                    <button onClick={(e) => { e.stopPropagation(); handleEdit(site); }} className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={(e) => handleDelete(e, site.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
               </div>
               
               <h3 className="text-xl font-bold mb-1 truncate">{site.name}</h3>
               <p className="text-sm text-slate-500 truncate mb-6">{site.location}</p>

               <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-white/5">
                 <div className="flex flex-col gap-1">
                   <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium uppercase tracking-wider">
                     <HardHat className="w-3.5 h-3.5" /> Workers
                   </div>
                   <span className="font-semibold text-slate-900 dark:text-white">{site._count?.workers || 0}</span>
                 </div>
                 <div className="flex flex-col gap-1 border-l border-slate-100 dark:border-white/5 pl-4">
                   <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium uppercase tracking-wider">
                     <Briefcase className="w-3.5 h-3.5" /> Projects
                   </div>
                   <span className="font-semibold text-slate-900 dark:text-white">{site._count?.projects || 0}</span>
                 </div>
               </div>

               <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-sm">
                 <span className="text-slate-500">Manager:</span>
                 <span className="font-medium text-slate-900 dark:text-orange-400">{site.subManager?.name || 'Unassigned'}</span>
               </div>
            </div>
          ))}

          {sites.length === 0 && !loading && (
            <div className="col-span-full py-12 flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl">
              <MapPin className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3" />
              <p>No operational sites found.</p>
              <button 
                onClick={() => setShowForm(true)}
                className="mt-4 text-orange-500 font-medium hover:underline"
              >
                Create your first site
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
