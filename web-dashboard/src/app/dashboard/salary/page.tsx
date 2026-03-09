"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Banknote, CreditCard, Clock, Building, ArrowDownToLine, Loader2 } from "lucide-react"

export default function SalaryPage() {
  const { data: session } = useSession()
  const [payrolls, setPayrolls] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/payroll")
       .then(res => res.json())
       .then(data => setPayrolls(Array.isArray(data) ? data : []))
       .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Earnings & Salary</h1>
          <p className="text-slate-500 mt-1">Review your income, payment history, and manage bank details.</p>
        </div>
        <button className="px-4 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-medium flex items-center gap-2 hover:bg-slate-800 transition shadow-sm self-start">
          <CreditCard className="w-4 h-4" /> Request Bank Change
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {/* Total Earnings Card */}
         <div className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 p-6 rounded-2xl shadow-xl text-white relative overflow-hidden">
            <div className="absolute -bottom-10 -right-10 opacity-20"><Banknote className="w-48 h-48" /></div>
            <p className="text-slate-300 font-medium text-sm mb-2 relative z-10">Total Received (YTD)</p>
            <h2 className="text-4xl font-extrabold relative z-10">AED 14,250.00</h2>
            <div className="mt-6 flex gap-4 relative z-10">
               <div className="flex items-center gap-2 text-sm text-slate-300 bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
                 <Building className="w-4 h-4" /> Paid via Bank Transfer
               </div>
            </div>
         </div>

         {/* Most Recent Salary */}
         <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm relative overflow-hidden">
            <p className="text-slate-500 font-medium text-sm mb-2">Upcoming/Latest Payroll</p>
            {payrolls.length > 0 ? (
               <>
                 <h2 className="text-4xl font-extrabold text-orange-500">AED {payrolls[0].totalAmount?.toFixed(2)}</h2>
                 <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mt-4 flex items-center gap-2">
                   <Clock className="w-4 h-4 text-orange-400" /> Status: <strong>{payrolls[0].status}</strong>
                 </p>
                 <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/5 flex gap-4 text-xs font-semibold text-slate-500">
                   <div>Base: AED {payrolls[0].baseSalary?.toFixed(2)}</div>
                   <div>Allowances: AED {payrolls[0].allowances?.toFixed(2)}</div>
                 </div>
               </>
            ) : (
               <div className="py-4 text-slate-400 italic">No recent payroll generated</div>
            )}
         </div>
      </div>

      <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden mt-8">
        <div className="p-6 border-b border-slate-200 dark:border-white/10">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Payment History</h3>
        </div>
        
        {loading ? (
             <div className="py-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-orange-500" /></div>
          ) : (
             <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse min-w-[600px]">
                 <thead>
                   <tr className="bg-slate-50 dark:bg-slate-900/50">
                     <th className="py-3 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200 dark:border-white/10">Period</th>
                     <th className="py-3 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200 dark:border-white/10">Working Days</th>
                     <th className="py-3 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200 dark:border-white/10">Overtime/Bonuses</th>
                     <th className="py-3 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200 dark:border-white/10 text-right">Net Paid</th>
                     <th className="py-3 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200 dark:border-white/10 text-center">Status</th>
                     <th className="py-3 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200 dark:border-white/10 text-center">Payslip</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    {payrolls.map(p => (
                       <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition">
                          <td className="py-4 px-6 text-sm font-medium text-slate-900 dark:text-white">
                             {new Date(p.periodStart).toLocaleDateString()} - <br/>{new Date(p.periodEnd).toLocaleDateString()}
                          </td>
                          <td className="py-4 px-6 text-sm text-center">
                             {p.workingDays}
                          </td>
                          <td className="py-4 px-6 text-sm text-emerald-600">
                             + AED {(p.overtime + p.bonuses).toFixed(2)}
                          </td>
                          <td className="py-4 px-6 font-bold text-slate-900 dark:text-white text-right">
                             AED {p.totalAmount?.toFixed(2)}
                          </td>
                          <td className="py-4 px-6 text-center">
                             <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border
                               ${['APPROVED', 'PAID'].includes(p.status) ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' 
                               : 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-white/10 dark:text-slate-300 dark:border-white/20'}
                             `}>
                                {p.status}
                             </span>
                          </td>
                          <td className="py-4 px-6 text-center">
                             <button className="p-2 text-slate-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-500/10 rounded-lg transition-colors inline-block">
                                <ArrowDownToLine className="w-4 h-4" />
                             </button>
                          </td>
                       </tr>
                    ))}
                    {payrolls.length === 0 && (
                       <tr>
                          <td colSpan={6} className="py-12 text-center text-slate-500">No payment history available.</td>
                       </tr>
                    )}
                 </tbody>
               </table>
             </div>
        )}
      </div>
    </div>
  )
}
