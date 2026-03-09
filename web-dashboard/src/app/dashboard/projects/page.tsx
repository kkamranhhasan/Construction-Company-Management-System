"use client"

import { useState, useEffect } from "react"
import { Briefcase, MapPin, Plus, Loader2, CalendarRange, CheckCircle2, Edit2, Trash2 } from "lucide-react"

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([])
  const [sites, setSites] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({ 
     name: "", location: "", startDate: "", expectedCompletion: "", 
     siteId: "", status: "PLANNING" 
  })

  useEffect(() => {
     Promise.all([
        fetch("/api/projects").then(res => res.json()),
        fetch("/api/sites").then(res => res.json())
     ])
     .then(([projData, siteData]) => {
        setProjects(Array.isArray(projData) ? projData : [])
        setSites(Array.isArray(siteData) ? siteData : [])
        setLoading(false)
     })
     .catch(() => setLoading(false))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (editingId) {
        await fetch(`/api/projects/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData)
        })
      } else {
        await fetch("/api/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData)
        })
      }
      const res = await fetch("/api/projects")
      setProjects(await res.json())
      setShowForm(false)
      setEditingId(null)
      setFormData({ name: "", location: "", startDate: "", expectedCompletion: "", siteId: "", status: "PLANNING" })
    } catch(err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (project: any) => {
    setFormData({
      name: project.name || "",
      location: project.location || "",
      startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : "",
      expectedCompletion: project.expectedCompletion ? new Date(project.expectedCompletion).toISOString().split('T')[0] : "",
      siteId: project.siteId || "",
      status: project.status || "PLANNING"
    })
    setEditingId(project.id)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    try {
      await fetch(`/api/projects/${id}`, { method: "DELETE" })
      setProjects(projects.filter(p => p.id !== id))
    } catch(err) {
      console.error(err)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE": return "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400"
      case "PLANNING": return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400"
      case "ON_HOLD": return "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400"
      case "COMPLETED": return "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400"
      default: return "bg-slate-100 text-slate-700 border-slate-200 dark:bg-white/5 dark:text-slate-400"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Project Portfolios</h1>
          <p className="text-slate-500 mt-1">Track timelines, documents, and progress of construction initiatives.</p>
        </div>
        <button 
          onClick={() => {
            setEditingId(null);
            setFormData({ name: "", location: "", startDate: "", expectedCompletion: "", siteId: "", status: "PLANNING" });
            setShowForm(!showForm);
          }}
          className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium flex items-center gap-2 transition shadow-[0_0_20px_rgba(249,115,22,0.2)] self-start"
        >
          <Plus className="w-4 h-4" /> New Project
        </button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm animate-in fade-in slide-in-from-top-4">
          <h3 className="text-lg font-semibold mb-6 border-b border-slate-100 dark:border-white/5 pb-3">
            {editingId ? "Edit Project" : "Project Details"}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Project Name</label>
              <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-500/50" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Assigned Site</label>
              <select required value={formData.siteId} onChange={e => setFormData({...formData, siteId: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-500/50">
                <option value="">Select a Site</option>
                {sites.map(site => <option key={site.id} value={site.id}>{site.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Start Date</label>
              <input type="date" required value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-500/50" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Expected Completion</label>
              <input type="date" value={formData.expectedCompletion} onChange={e => setFormData({...formData, expectedCompletion: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-500/50" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Location specific details</label>
              <input type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-500/50" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Status</label>
              <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-500/50">
                <option value="PLANNING">Planning</option>
                <option value="ACTIVE">Active</option>
                <option value="ON_HOLD">On Hold</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
            <div className="md:col-span-2 pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-white/5">
              <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl font-medium transition text-sm">Cancel</button>
              <button type="submit" className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium transition shadow-sm text-sm">
                {editingId ? "Save Changes" : "Create Project"}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading && !showForm ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-orange-500" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => (
            <div key={project.id} className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm flex flex-col group hover:border-orange-500/50 transition-colors">
               <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 rounded-xl">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 text-[10px] uppercase tracking-wider font-bold rounded-full border ${getStatusColor(project.status)}`}>
                      {project.status}
                    </span>
                    <button onClick={() => handleEdit(project)} className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(project.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
               </div>
               
               <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1 line-clamp-1">{project.name}</h3>
               <p className="text-sm font-medium text-slate-500 flex items-center gap-1.5 mb-6">
                 <MapPin className="w-4 h-4 text-orange-500" /> {project.site?.name || 'Unassigned Site'}
               </p>

               <div className="space-y-4 flex-1">
                 <div className="flex justify-between items-center text-sm border-b border-slate-100 dark:border-white/5 pb-3">
                   <div className="flex items-center gap-2 text-slate-500">
                     <CalendarRange className="w-4 h-4" /> Start
                   </div>
                   <span className="font-medium text-slate-900 dark:text-slate-300">
                     {new Date(project.startDate).toLocaleDateString()}
                   </span>
                 </div>
                 <div className="flex justify-between items-center text-sm pb-1">
                   <div className="flex items-center gap-2 text-slate-500">
                     <CheckCircle2 className="w-4 h-4" /> End
                   </div>
                   <span className="font-medium text-slate-900 dark:text-slate-300">
                     {project.expectedCompletion ? new Date(project.expectedCompletion).toLocaleDateString() : 'TBD'}
                   </span>
                 </div>
               </div>

               <div className="pt-6 mt-4 border-t border-slate-100 dark:border-white/5">
                 <button className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-medium rounded-xl transition-colors">
                   View Dashboard
                 </button>
               </div>
            </div>
          ))}

          {projects.length === 0 && !loading && (
            <div className="col-span-full py-16 flex flex-col items-center justify-center text-slate-500 bg-slate-50 dark:bg-slate-900/30 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-3xl">
              <Briefcase className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-4" />
              <p className="font-medium">No projects are currently running.</p>
              <button onClick={() => setShowForm(true)} className="mt-4 text-sm font-medium text-orange-500 hover:text-orange-600">Start new project</button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
