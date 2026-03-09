"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Banknote, FileText, CheckCircle2, ShieldCheck, Clock, Loader2, ArrowRight, Edit2, Trash2 } from "lucide-react"

export default function PayrollPage() {
  const { data: session } = useSession()
  const role = session?.user?.role
  
  const [payrolls, setPayrolls] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [editingPayroll, setEditingPayroll] = useState<any>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  
  const [editForm, setEditForm] = useState({
      baseSalary: 0, overtime: 0, bonuses: 0, 
      allowances: 0, deductions: 0, penalties: 0, status: "DRAFT"
  })

  const fetchPayrolls = async () => {
    try {
      const res = await fetch("/api/payroll")
      const data = await res.json()
      setPayrolls(Array.isArray(data) ? data : [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchPayrolls() }, [])

  const handleGenerate = async () => {
    setIsGenerating(true)
    try {
      // Typically you'd have a date picker for periods. Using current month for demo.
      const now = new Date()
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)

      await fetch("/api/payroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "GENERATE_BATCH", periodStart: firstDay, periodEnd: lastDay })
      })
      await fetchPayrolls()
    } finally {
      setIsGenerating(false)
    }
  }

  const handleApprove = async (payrollId: string) => {
    try {
      await fetch("/api/payroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "SUBMIT_APPROVAL", payrollId })
      })
      await fetchPayrolls()
    } catch(err) {
      console.error(err)
    }
  }

  const handleEditOpen = (payroll: any) => {
    setEditForm({
      baseSalary: payroll.baseSalary || 0,
      overtime: payroll.overtime || 0,
      bonuses: payroll.bonuses || 0,
      allowances: payroll.allowances || 0,
      deductions: payroll.deductions || 0,
      penalties: payroll.penalties || 0,
      status: payroll.status || "DRAFT"
    })
    setEditingPayroll(payroll)
    setIsEditModalOpen(true)
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await fetch(`/api/payroll/${editingPayroll.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm)
      })
      await fetchPayrolls()
      setIsEditModalOpen(false)
      setEditingPayroll(null)
    } catch(err) {
      console.error(err)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this payroll record?")) return;
    try {
      await fetch(`/api/payroll/${id}`, { method: "DELETE" })
      setPayrolls(payrolls.filter(p => p.id !== id))
    } catch(err) {
      console.error(err)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financial & Payroll Center</h1>
          <p className="text-slate-500 mt-1">Manage, approve, and disburse automated payouts.</p>
        </div>
        
        {["OWNER", "ADMIN"].includes(role as string) && (
          <button 
             onClick={handleGenerate}
             disabled={isGenerating}
             className="px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-medium flex items-center gap-2 hover:bg-slate-800 dark:hover:bg-slate-100 transition shadow-sm self-start disabled:opacity-50"
          >
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Banknote className="w-4 h-4" />}
            Generate New Batch
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
         <div className="p-6 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition">
               <FileText className="w-16 h-16 text-slate-500" />
            </div>
            <p className="text-sm font-medium text-slate-500 mb-1">Draft & Generated</p>
            <h3 className="text-3xl font-bold">{payrolls.filter(p => p.status === 'GENERATED' || p.status === 'DRAFT').length}</h3>
         </div>
         <div className="p-6 bg-blue-50 dark:bg-blue-500/10 rounded-2xl border border-blue-100 dark:border-blue-500/20 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-20">
               <Clock className="w-16 h-16 text-blue-500" />
            </div>
            <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">Pending Review</p>
            <h3 className="text-3xl font-bold text-blue-700 dark:text-blue-300">{payrolls.filter(p => p.status === 'SUBMITTED').length}</h3>
         </div>
         <div className="p-6 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl border border-emerald-100 dark:border-emerald-500/20 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-20">
               <ShieldCheck className="w-16 h-16 text-emerald-500" />
            </div>
            <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-1">Approved & Paid</p>
            <h3 className="text-3xl font-bold text-emerald-700 dark:text-emerald-300">{payrolls.filter(p => p.status === 'APPROVED' || p.status === 'PAID').length}</h3>
         </div>
      </div>

      <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-white/10 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Active Payroll Runs</h3>
        </div>
        
        {loading ? (
           <div className="py-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-orange-500" /></div>
        ) : (
           <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse">
               <thead>
                 <tr className="bg-slate-50 dark:bg-slate-900/50">
                   <th className="py-3 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200 dark:border-white/10">Worker</th>
                   <th className="py-3 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200 dark:border-white/10">Period</th>
                   <th className="py-3 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200 dark:border-white/10 text-right">Base (AED)</th>
                   <th className="py-3 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200 dark:border-white/10 text-right">Net Total (AED)</th>
                   <th className="py-3 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200 dark:border-white/10 text-center">Status</th>
                   <th className="py-3 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200 dark:border-white/10 text-right">Action</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {payrolls.map(p => (
                     <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition">
                        <td className="py-4 px-6">
                           <p className="font-semibold text-sm text-slate-900 dark:text-white">{p.worker?.user?.name}</p>
                           <p className="text-xs text-slate-500">{p.worker?.jobTitle}</p>
                        </td>
                        <td className="py-4 px-6 text-sm text-slate-600 dark:text-slate-400">
                           {new Date(p.periodStart).toLocaleDateString()} - <br className="lg:hidden"/> {new Date(p.periodEnd).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-6 text-sm text-slate-600 dark:text-slate-400 text-right">
                           {p.baseSalary?.toFixed(2)}
                        </td>
                        <td className="py-4 px-6 font-bold text-slate-900 dark:text-white text-right">
                           {p.totalAmount?.toFixed(2)}
                        </td>
                        <td className="py-4 px-6 text-center">
                           <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                             ${p.status === 'DRAFT' ? 'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300' 
                             : p.status === 'SUBMITTED' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400' 
                             : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'}
                           `}>
                              {p.status}
                           </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                           <div className="flex items-center justify-end gap-2 text-sm font-medium">
                             {p.status === 'DRAFT' && ["OWNER", "ADMIN"].includes(role as string) && (
                                <button onClick={() => handleApprove(p.id)} className="text-orange-600 hover:text-orange-700 font-medium text-sm flex items-center justify-end flex-1 gap-1 transition">
                                  Submit <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                             )}
                             {p.status === 'SUBMITTED' && ["OWNER"].includes(role as string) && (
                                <button className="text-emerald-600 hover:text-emerald-700 font-medium text-sm flex items-center justify-end flex-1 gap-1 transition">
                                  Approve <CheckCircle2 className="w-3.5 h-3.5" />
                                </button>
                             )}
                             {["OWNER", "ADMIN"].includes(role as string) && (
                                <>
                                  <button onClick={() => handleEditOpen(p)} className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition" title="Edit Record">
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button onClick={() => handleDelete(p.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition" title="Delete Record">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </>
                             )}
                           </div>
                        </td>
                     </tr>
                  ))}

                  {payrolls.length === 0 && (
                     <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-500">No payroll records generated yet.</td>
                     </tr>
                  )}
               </tbody>
             </table>
           </div>
        )}
      </div>

      {isEditModalOpen && editingPayroll && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 dark:border-white/10 animate-in fade-in zoom-in-95">
            <h3 className="text-xl font-bold mb-1">Edit Payroll Record</h3>
            <p className="text-sm text-slate-500 mb-6">Modify financial components for {editingPayroll.worker?.user?.name}</p>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Base Salary</label>
                  <input type="number" step="0.01" value={editForm.baseSalary} onChange={e => setEditForm({...editForm, baseSalary: parseFloat(e.target.value) || 0})} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-500/50" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Overtime</label>
                  <input type="number" step="0.01" value={editForm.overtime} onChange={e => setEditForm({...editForm, overtime: parseFloat(e.target.value) || 0})} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-500/50" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Bonuses</label>
                  <input type="number" step="0.01" value={editForm.bonuses} onChange={e => setEditForm({...editForm, bonuses: parseFloat(e.target.value) || 0})} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-500/50" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Allowances</label>
                  <input type="number" step="0.01" value={editForm.allowances} onChange={e => setEditForm({...editForm, allowances: parseFloat(e.target.value) || 0})} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-500/50" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Deductions</label>
                  <input type="number" step="0.01" value={editForm.deductions} onChange={e => setEditForm({...editForm, deductions: parseFloat(e.target.value) || 0})} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-500/50" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Penalties</label>
                  <input type="number" step="0.01" value={editForm.penalties} onChange={e => setEditForm({...editForm, penalties: parseFloat(e.target.value) || 0})} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-500/50" />
                </div>
                <div className="space-y-1 col-span-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Status</label>
                  <select value={editForm.status} onChange={e => setEditForm({...editForm, status: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-500/50">
                     <option value="DRAFT">Draft</option>
                     <option value="GENERATED">Generated</option>
                     <option value="SUBMITTED">Submitted</option>
                     <option value="APPROVED">Approved</option>
                     <option value="PAID">Paid</option>
                  </select>
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 px-4 py-2.5 rounded-xl font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2.5 rounded-xl font-medium text-white bg-orange-500 hover:bg-orange-600 shadow-sm transition">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
