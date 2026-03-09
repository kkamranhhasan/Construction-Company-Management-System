"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Users, Plus, Loader2, HardHat, Phone, MapPin, Search, Edit2, CheckSquare, Trash2 } from "lucide-react"

export default function WorkersPage() {
  const { data: session } = useSession()
  const role = session?.user?.role || "WORKER"
  const [workers, setWorkers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  
  const [formData, setFormData] = useState({
     name: "", email: "", emiratesId: "", phone: "", 
     nationality: "", jobTitle: "", skillCategory: "", dailyWage: ""
  })

  // Site Assignment State
  const [sites, setSites] = useState<any[]>([])
  const [assignModalOpen, setAssignModalOpen] = useState(false)
  const [selectedWorker, setSelectedWorker] = useState<any>(null)
  const [selectedSiteIds, setSelectedSiteIds] = useState<string[]>([])
  const [savingAssign, setSavingAssign] = useState(false)

  useEffect(() => { 
    fetchWorkers()
    fetchSites()
  }, [])

  const fetchWorkers = async () => {
    try {
      const res = await fetch("/api/workers")
      const data = await res.json()
      setWorkers(Array.isArray(data) ? data : [])
    } finally { setLoading(false) }
  }

  const fetchSites = async () => {
    try {
      const res = await fetch("/api/sites")
      const data = await res.json()
      setSites(Array.isArray(data) ? data : [])
    } catch(err) {
      console.error(err)
    }
  }

  const openAssignModal = (worker: any) => {
    setSelectedWorker(worker)
    const assignedIds = worker.assignedSites?.map((as: any) => as.siteId) || []
    const visibleIds = assignedIds.filter((id: string) => sites.some(s => s.id === id))
    setSelectedSiteIds(visibleIds)
    setAssignModalOpen(true)
  }

  const handleToggleSite = (siteId: string) => {
    setSelectedSiteIds(prev => 
      prev.includes(siteId) ? prev.filter(id => id !== siteId) : [...prev, siteId]
    )
  }

  const handleSaveAssignments = async () => {
    if (!selectedWorker) return
    setSavingAssign(true)
    try {
      const res = await fetch("/api/workers/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workerId: selectedWorker.id,
          siteIds: selectedSiteIds
        })
      })
      if (res.ok) {
        await fetchWorkers()
        setAssignModalOpen(false)
      }
    } catch(err) {
      console.error(err)
    } finally {
      setSavingAssign(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (editingId) {
        await fetch(`/api/workers/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData)
        })
      } else {
        await fetch("/api/workers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData)
        })
      }
      await fetchWorkers()
      setShowForm(false)
      setEditingId(null)
      setFormData({ name: "", email: "", emiratesId: "", phone: "", nationality: "", jobTitle: "", skillCategory: "", dailyWage: "" })
    } catch(err) {
      console.error(err)
      setLoading(false)
    }
  }

  const handleEdit = (worker: any) => {
    setFormData({
      name: worker.user?.name || "",
      email: worker.user?.email || "",
      emiratesId: worker.emiratesId || "",
      phone: worker.phone || "",
      nationality: worker.nationality || "",
      jobTitle: worker.jobTitle || "",
      skillCategory: worker.skillCategory || "",
      dailyWage: worker.dailyWage ? worker.dailyWage.toString() : ""
    })
    setEditingId(worker.userId)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleDelete = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this worker? This action cannot be undone.")) return;
    try {
      await fetch(`/api/workers/${userId}`, { method: "DELETE" })
      setWorkers(workers.filter(w => w.userId !== userId))
    } catch(err) {
      console.error(err)
    }
  }

  const filteredWorkers = workers.filter(w => 
     w.user?.name?.toLowerCase().includes(search.toLowerCase()) || 
     w.jobTitle?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Workforce Management</h1>
          <p className="text-slate-500 mt-1">Manage personnel, roles, and site deployments.</p>
        </div>
        {["OWNER", "ADMIN"].includes(role) && (
          <button 
            onClick={() => {
              setEditingId(null);
              setFormData({ name: "", email: "", emiratesId: "", phone: "", nationality: "", jobTitle: "", skillCategory: "", dailyWage: "" });
              setShowForm(!showForm);
            }}
            className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium flex items-center gap-2 transition shadow-[0_0_20px_rgba(249,115,22,0.2)] self-start"
          >
            <Plus className="w-4 h-4" /> Onboard Worker
          </button>
        )}
      </div>

      <div className="flex items-center relative max-w-md">
         <Search className="w-4 h-4 absolute left-3 text-slate-400" />
         <input 
           type="text" value={search} onChange={e => setSearch(e.target.value)}
           placeholder="Search workers by name or role..."
           className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-500/50 shadow-sm"
         />
      </div>

      {showForm && (
        <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm animate-in fade-in slide-in-from-top-4">
          <h3 className="text-lg font-semibold mb-6 border-b border-slate-100 dark:border-white/5 pb-3">
            {editingId ? "Edit Worker Details" : "New Worker Registration"}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Full Name</label>
              <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Email (Optional)</label>
              <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Emirates ID</label>
              <input type="text" required value={formData.emiratesId} onChange={e => setFormData({...formData, emiratesId: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Job Title</label>
              <input type="text" required value={formData.jobTitle} onChange={e => setFormData({...formData, jobTitle: e.target.value})} placeholder="e.g. Mason, Electrician" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Skill Category</label>
              <select value={formData.skillCategory} onChange={e => setFormData({...formData, skillCategory: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50">
                 <option value="">Select Level</option>
                 <option value="Skilled">Skilled</option>
                 <option value="Semi-Skilled">Semi-Skilled</option>
                 <option value="Unskilled">Unskilled</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Daily Wage (AED)</label>
              <input type="number" required value={formData.dailyWage} onChange={e => setFormData({...formData, dailyWage: e.target.value})} placeholder="0.00" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50" />
            </div>
            <div className="lg:col-span-3 pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-white/5">
              <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl font-medium transition text-sm">Cancel</button>
              <button type="submit" className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium transition shadow-sm text-sm">
                {editingId ? "Save Changes" : "Onboard Worker"}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading && !showForm ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-orange-500" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredWorkers.map(worker => (
            <div key={worker.id} className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm hover:shadow-md transition-all overflow-hidden relative">
               <div className="h-24 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 relative">
                 <div className="absolute -bottom-6 left-6 w-16 h-16 bg-white dark:bg-slate-950 rounded-2xl flex items-center justify-center shadow-lg border-2 border-slate-100 dark:border-slate-800 text-slate-400">
                    <Users className="w-8 h-8" />
                 </div>
                 <div className="absolute top-4 right-4">
                    <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full bg-white/50 dark:bg-black/50 backdrop-blur-sm border border-black/5 dark:border-white/10">
                      ID: {worker.emiratesId?.slice(-6) || "N/A"}
                    </span>
                 </div>
               </div>
               
               <div className="px-6 pt-10 pb-6">
                 <h3 className="font-bold text-lg text-slate-900 dark:text-white">{worker.user?.name}</h3>
                 <p className="text-sm font-medium text-orange-500 mb-4">{worker.jobTitle || 'Unassigned Role'}</p>
                 
                 <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                      <HardHat className="w-4 h-4 text-slate-400" /> {worker.skillCategory || 'Unknown'} Level
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                      <Phone className="w-4 h-4 text-slate-400" /> {worker.phone || 'No phone provided'}
                    </div>
                 </div>

                 <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex items-start justify-between">
                   <div className="flex-1">
                     {worker.assignedSites?.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {worker.assignedSites.map((as: any) => (
                            <span key={as.siteId} className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-800 text-xs font-medium rounded-lg text-slate-700 dark:text-slate-300">
                               <MapPin className="w-3 h-3 text-orange-500" />
                               {as.site?.name}
                            </span>
                          ))}
                        </div>
                     ) : (
                       <p className="text-xs text-slate-400 italic">No assigned sites</p>
                     )}
                   </div>
                   {["OWNER", "ADMIN"].includes(role) && (
                     <div className="flex items-center gap-1 shrink-0 ml-2">
                       <button 
                         onClick={() => openAssignModal(worker)} 
                         className="p-1.5 text-slate-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-500/10 rounded-lg transition"
                         title="Assign to Sites"
                       >
                         <MapPin className="w-4 h-4" />
                       </button>
                       <button 
                         onClick={() => handleEdit(worker)} 
                         className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition"
                         title="Edit Details"
                       >
                         <Edit2 className="w-4 h-4" />
                       </button>
                       <button 
                         onClick={() => handleDelete(worker.userId)} 
                         className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition"
                         title="Delete Worker"
                       >
                         <Trash2 className="w-4 h-4" />
                       </button>
                     </div>
                   )}
                 </div>
               </div>
            </div>
          ))}

          {filteredWorkers.length === 0 && !loading && (
            <div className="col-span-full py-16 flex flex-col items-center justify-center text-slate-500 bg-white/50 dark:bg-slate-950/50 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-3xl">
              <Users className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-4" />
              <p className="font-medium text-slate-600 dark:text-slate-400">No workers found matching your criteria.</p>
              <button onClick={() => setShowForm(true)} className="mt-4 text-sm font-medium text-orange-500 hover:text-orange-600">Register new worker</button>
            </div>
          )}
        </div>
      )}

      {/* Assignment Modal */}
      {assignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 dark:border-white/10 animate-in fade-in zoom-in-95">
            <h3 className="text-xl font-bold mb-1">Assign to Sites</h3>
            <p className="text-sm text-slate-500 mb-6">Select sites where <span className="font-semibold text-slate-900 dark:text-white">{selectedWorker?.user?.name}</span> is actively deployed.</p>

            <div className="space-y-3 max-h-64 overflow-y-auto mb-6 pr-2">
               {sites.map(site => (
                <label 
                  key={site.id} 
                  onClick={() => handleToggleSite(site.id)}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  selectedSiteIds.includes(site.id) ? 'border-orange-500 bg-orange-50 dark:bg-orange-500/10' : 'border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}>
                   <div className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${
                     selectedSiteIds.includes(site.id) ? 'bg-orange-500 text-white' : 'border border-slate-300 dark:border-slate-700'
                   }`}>
                      {selectedSiteIds.includes(site.id) && <CheckSquare className="w-3.5 h-3.5" />}
                   </div>
                   <div>
                     <p className="text-sm font-semibold text-slate-900 dark:text-white">{site.name}</p>
                     <p className="text-xs text-slate-500">{site.location}</p>
                   </div>
                </label>
               ))}
               {sites.length === 0 && (
                 <p className="text-sm text-slate-500 italic text-center py-4">No active sites found in the system.</p>
               )}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setAssignModalOpen(false)} className="flex-1 px-4 py-2.5 rounded-xl font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition">Cancel</button>
              <button 
                onClick={handleSaveAssignments} 
                disabled={savingAssign}
                className="flex-1 px-4 py-2.5 rounded-xl font-medium text-white bg-orange-500 hover:bg-orange-600 shadow-[0_0_20px_rgba(249,115,22,0.3)] transition flex items-center justify-center gap-2"
              >
                {savingAssign ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Assignments"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
