"use client"

import { Activity, ClockAlert, UsersIcon, ShieldCheck } from "lucide-react"

export function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Admin Operations Center</h1>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Active Project Sites", value: "12", icon: Activity },
          { label: "Total Workforce", value: "650", icon: UsersIcon },
          { label: "Late Arrivals Today", value: "14", icon: ClockAlert },
          { label: "Payroll Readiness", value: "98%", icon: ShieldCheck },
        ].map((kpi, i) => (
          <div key={i} className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm flex items-center gap-4">
             <div className="p-3 bg-orange-500/10 rounded-xl text-orange-500 rounded-xl">
               <kpi.icon className="w-6 h-6" />
             </div>
             <div>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{kpi.value}</p>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{kpi.label}</p>
             </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Active Sites Status</h3>
          <div className="space-y-3">
             {[
               { site: "Downtown Tower", workers: 145, progress: 68 },
               { site: "South Station Expansion", workers: 84, progress: 42 },
               { site: "Riverfront Condos", workers: 212, progress: 85 },
               { site: "East Valley Mall", workers: 95, progress: 15 },
             ].map((site, i) => (
                <div key={i} className="p-4 border border-slate-100 dark:border-white/5 rounded-xl bg-slate-50 dark:bg-slate-900/50">
                  <div className="flex justify-between items-end mb-2">
                    <h4 className="font-semibold text-slate-800 dark:text-slate-200">{site.site}</h4>
                    <span className="text-sm text-slate-500">{site.workers} Active Workers</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2">
                    <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${site.progress}%` }}></div>
                  </div>
                </div>
             ))}
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Recent Alerts</h3>
          <ul className="space-y-4">
             <li className="flex gap-3 text-sm p-3 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 rounded-lg">
                <ClockAlert className="w-5 h-5 shrink-0" />
                <span>Attendance alert: 12 workers failed GPS verification at South Station Expansion. Requires manual review.</span>
             </li>
             <li className="flex gap-3 text-sm p-3 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 rounded-lg">
                <UsersIcon className="w-5 h-5 shrink-0" />
                <span>Sub-manager requested 5 additional carpenters for Riverfront Condos.</span>
             </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
