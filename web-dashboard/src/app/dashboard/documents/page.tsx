"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { FileText, UploadCloud, FolderOpen, Image as ImageIcon, FileCheck, CheckCircle2, Search, Loader2, Edit2, Trash2 } from "lucide-react"

export default function DocumentsPage() {
  const { data: session } = useSession()
  const role = session?.user?.role
  
  const [documents, setDocuments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({ type: "PASSPORT", name: "", url: "", expiresAt: "", status: "PENDING", targetRole: "", recipientId: "" })
  const [uploading, setUploading] = useState(false)
  const [contacts, setContacts] = useState<any[]>([])

  const fetchDocs = async () => {
     try {
       const res = await fetch("/api/documents")
       const data = await res.json()
       setDocuments(Array.isArray(data) ? data : [])
     } finally { setLoading(false) }
  }

  useEffect(() => { 
     fetchDocs()
     fetch("/api/users/contacts").then(res => res.json()).then(data => {
         if (Array.isArray(data)) setContacts(data)
     }).catch(console.error)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault()
     setUploading(true)
     
     if (editingId) {
        try {
           await fetch(`/api/documents/${editingId}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(formData)
           })
           await fetchDocs()
           setShowForm(false)
           setEditingId(null)
           setFormData({ type: "PASSPORT", name: "", url: "", expiresAt: "", status: "PENDING", targetRole: "", recipientId: "" })
           setUploading(false)
        } catch(err) {
           console.error(err)
           setUploading(false)
        }
     } else {
        // Simulate file upload delay for create
        setTimeout(async () => {
            try {
               await fetch("/api/documents", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ ...formData, url: `https://storage.buildcore.app/files/${Math.random().toString(36).substr(2, 9)}.pdf` })
               })
               await fetchDocs()
               setShowForm(false)
               setFormData({ type: "PASSPORT", name: "", url: "", expiresAt: "", status: "PENDING", targetRole: "", recipientId: "" })
            } finally {
               setUploading(false)
            }
        }, 1500)
     }
  }

  const handleEdit = (doc: any) => {
    setFormData({
      type: doc.type || "PASSPORT",
      name: doc.title || doc.name || "",
      url: doc.url || "",
      expiresAt: doc.expiresAt ? new Date(doc.expiresAt).toISOString().split('T')[0] : "",
      status: doc.status || "PENDING",
      targetRole: doc.targetRole || "",
      recipientId: doc.recipientId || ""
    })
    setEditingId(doc.id)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this document?")) return;
    try {
      await fetch(`/api/documents/${id}`, { method: "DELETE" })
      setDocuments(documents.filter(d => d.id !== id))
    } catch(err) {
      console.error(err)
    }
  }

  const filteredDocs = documents.filter(d => {
     const docName = d.title || d.name || "";
     const docType = d.type || "";
     return docName.toLowerCase().includes(search.toLowerCase()) || 
            docType.toLowerCase().includes(search.toLowerCase());
  })

  const getDocIcon = (type: string) => {
     switch (type) {
         case "PASSPORT": 
         case "VISA": 
         case "ID": return <FileCheck className="w-8 h-8 text-blue-500" />
         case "CONTRACT": return <FileText className="w-8 h-8 text-orange-500" />
         case "CERTIFICATION": return <CheckCircle2 className="w-8 h-8 text-emerald-500" />
         case "NOTICE": return <FileText className="w-8 h-8 text-red-500" />
         case "INSTRUCTION": return <FileText className="w-8 h-8 text-purple-500" />
         case "REPORT": return <FileText className="w-8 h-8 text-blue-500" />
         case "ADVICE": return <FileText className="w-8 h-8 text-emerald-500" />
         default: return <FileText className="w-8 h-8 text-slate-500" />
     }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Document Vault</h1>
          <p className="text-slate-500 mt-1">Safely store and track worker credentials, contracts, and permits.</p>
        </div>
        <button 
          onClick={() => {
            setEditingId(null);
            setFormData({ type: "PASSPORT", name: "", url: "", expiresAt: "", status: "PENDING", targetRole: "", recipientId: "" });
            setShowForm(!showForm);
          }}
          className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium flex items-center gap-2 transition shadow-sm self-start"
        >
          <UploadCloud className="w-4 h-4" /> Upload Document
        </button>
      </div>

      <div className="flex items-center relative max-w-md">
         <Search className="w-4 h-4 absolute left-3 text-slate-400" />
         <input 
           type="text" value={search} onChange={e => setSearch(e.target.value)}
           placeholder="Search files by name or type..."
           className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-500/50 shadow-sm"
         />
      </div>

      {showForm && (
         <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm animate-in fade-in slide-in-from-top-4">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              {editingId ? <Edit2 className="w-5 h-5 text-orange-500" /> : <UploadCloud className="w-5 h-5 text-orange-500" />} 
              {editingId ? "Edit Document" : "Secure Upload Portal"}
            </h3>
            
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
               <div className="space-y-2">
                 <label className="text-xs font-medium text-slate-500 uppercase">Document Name</label>
                 <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-500/50" />
               </div>
               <div className="space-y-2">
                 <label className="text-xs font-medium text-slate-500 uppercase">Document Type</label>
                 <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-500/50">
                    <option value="ID">Emirates ID</option>
                    <option value="PASSPORT">Passport</option>
                    <option value="VISA">Labor Visa</option>
                    <option value="CONTRACT">Employment Contract</option>
                    <option value="CERTIFICATION">Safety Certification</option>
                    <option value="NOTICE">Notice</option>
                    <option value="INSTRUCTION">Instruction</option>
                    <option value="REPORT">Report</option>
                    <option value="ADVICE">Advice</option>
                    <option value="OTHER">Other</option>
                 </select>
               </div>
               
               {['NOTICE', 'INSTRUCTION', 'REPORT', 'ADVICE'].includes(formData.type) && (
                 <>
                   <div className="space-y-2">
                     <label className="text-xs font-medium text-slate-500 uppercase">Target Role (Optional)</label>
                     <select value={formData.targetRole} onChange={e => setFormData({...formData, targetRole: e.target.value, recipientId: ''})} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-500/50">
                        <option value="">Specific User Instead</option>
                        {['OWNER', 'ADMIN'].includes(role as string) && <option value="ALL">All Users</option>}
                        {['OWNER', 'ADMIN'].includes(role as string) && <option value="ALL WORKERS">All Workers</option>}
                        {['OWNER', 'ADMIN'].includes(role as string) && <option value="ALL SUBMANAGERS">All SubManagers</option>}
                        {['SUB_MANAGER'].includes(role as string) && <option value="ALL WORKERS">All My Workers</option>}
                     </select>
                   </div>
                   {!formData.targetRole && (
                     <div className="space-y-2">
                       <label className="text-xs font-medium text-slate-500 uppercase">Specific Recipient</label>
                       <select required={!formData.targetRole} value={formData.recipientId} onChange={e => setFormData({...formData, recipientId: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-500/50">
                          <option value="">Select Recipient...</option>
                          {contacts.map(c => <option key={c.id} value={c.id}>{c.name || c.email} ({c.role})</option>)}
                       </select>
                     </div>
                   )}
                 </>
               )}

               <div className="space-y-2">
                 <label className="text-xs font-medium text-slate-500 uppercase">Expiration Date (If Applicable)</label>
                 <input type="date" value={formData.expiresAt} onChange={e => setFormData({...formData, expiresAt: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-500/50" />
               </div>
               {editingId && (
                 <div className="space-y-2">
                   <label className="text-xs font-medium text-slate-500 uppercase">Verification Status</label>
                   <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-500/50">
                      <option value="PENDING">Pending</option>
                      <option value="VERIFIED">Verified</option>
                      <option value="EXPIRED">Expired</option>
                   </select>
                 </div>
               )}
               {!editingId && (
                 <div className="lg:col-span-3 space-y-2">
                   <label className="text-xs font-medium text-slate-500 uppercase">File Upload</label>
                   <div className="w-full h-32 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-xl bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex flex-col items-center justify-center cursor-pointer relative">
                      <input type="file" required className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                      <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
                      <p className="text-sm text-slate-500">Click or drag and drop to upload PDF, PNG or JPG max 10MB</p>
                   </div>
                 </div>
               )}
               <div className="lg:col-span-3 pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-white/5">
                 <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl font-medium transition text-sm">Cancel</button>
                 <button type="submit" disabled={uploading} className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-xl font-medium flex items-center gap-2 transition shadow-sm text-sm">
                   {uploading ? <><Loader2 className="w-4 h-4 animate-spin"/> {editingId ? "Saving..." : "Uploading..."}</> : (editingId ? "Save Changes" : "Submit Record")}
                 </button>
               </div>
            </form>
         </div>
      )}

      {loading && !showForm ? (
         <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-orange-500" /></div>
      ) : (
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredDocs.map(doc => (
               <div key={doc.id} className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm hover:border-orange-500/50 transition-colors group cursor-pointer flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                     {getDocIcon(doc.type)}
                     <div className="text-right">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${doc.status === 'VERIFIED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'}`}>
                           {doc.status}
                        </span>
                     </div>
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white line-clamp-2 min-h-[40px] mb-1">{doc.title || doc.name}</h3>
                  <div className="flex justify-between items-center mb-4 text-slate-500">
                    <p className="text-xs uppercase tracking-wider font-semibold">{doc.type}</p>
                    {["OWNER", "ADMIN"].includes(role as string) && (
                      <div className="flex items-center gap-1">
                        <button onClick={(e) => { e.stopPropagation(); handleEdit(doc); }} className="p-1 hover:text-blue-500 dark:hover:text-blue-400 transition" title="Edit Document">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={(e) => handleDelete(e, doc.id)} className="p-1 hover:text-red-500 dark:hover:text-red-400 transition" title="Delete Document">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-auto space-y-2">
                     <div className="text-xs text-slate-500 bg-slate-50 dark:bg-slate-900 px-3 py-2 rounded-lg break-all group-hover:bg-orange-50 dark:group-hover:bg-orange-500/10 transition-colors">
                        Uploaded by {doc.uploader?.name || 'System'}
                     </div>
                     {(doc.targetRole || doc.recipient) && (
                         <div className="text-xs text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10 px-3 py-2 rounded-lg break-all flex items-center gap-1">
                            Shared with: {doc.targetRole ? doc.targetRole : doc.recipient?.name}
                         </div>
                     )}
                     {doc.expiresAt && (
                        <div className={`text-xs px-3 py-2 rounded-lg font-medium flex justify-between
                           ${new Date(doc.expiresAt as string) < new Date() ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400' : 'bg-slate-50 text-slate-600 dark:bg-slate-900 dark:text-slate-400'}
                        `}>
                           <span>Expires:</span>
                           <span>{new Date(doc.expiresAt).toLocaleDateString()}</span>
                        </div>
                     )}
                  </div>
               </div>
            ))}

            {filteredDocs.length === 0 && !loading && (
               <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-3xl bg-slate-50 dark:bg-slate-900/30">
                  <FolderOpen className="w-16 h-16 text-slate-300 dark:text-slate-700 mb-4" />
                  <p className="font-medium">No documents found in the vault.</p>
                  <button onClick={() => setShowForm(true)} className="mt-4 text-orange-500 font-medium hover:underline">Upload your first document</button>
               </div>
            )}
         </div>
      )}
    </div>
  )
}
