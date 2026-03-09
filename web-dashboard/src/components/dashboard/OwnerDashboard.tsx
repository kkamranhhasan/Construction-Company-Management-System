"use client"

import { Building2, Users, HardHat, TrendingUp, AlertTriangle } from "lucide-react"

export function OwnerDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Owner Overview</h1>
        <div className="flex gap-2 text-sm text-slate-500">
          Last updated: Today at 8:00 AM
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Revenue", value: "AED 4.2M", diff: "+12.5%", isPositive: true, icon: TrendingUp },
          { label: "Active Project Sites", value: "14", diff: "0%", isPositive: true, icon: Building2 },
          { label: "Total Workforce", value: "850", diff: "+2%", isPositive: true, icon: Users },
          { label: "Safety Incidents", value: "0", diff: "-1", isPositive: true, icon: AlertTriangle },
        ].map((kpi, i) => (
          <div key={i} className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <kpi.icon className="w-6 h-6 text-orange-500" />
              <span className={`text-sm font-medium ${kpi.isPositive ? "text-emerald-500" : "text-red-500"}`}>
                {kpi.diff}
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-1">{kpi.label}</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        {/* Main Chart Area */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm min-h-[400px]">
          <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Project Financials Overview</h3>
          <div className="h-[300px] w-full flex items-center justify-center bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-white/5">
            <span className="text-slate-400">Financial Chart Visualization will be here</span>
          </div>
        </div>

        {/* Needs Approval Area */}
        <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
           <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Pending Approvals</h3>
           
           <div className="space-y-4">
             {[
               { title: "Weekly Payroll", subtitle: "Downtown Tower Project", amount: "AED 84,500" },
               { title: "Material Invoice", subtitle: "Supplier: SteelCo", amount: "AED 12,400" },
               { title: "New Hire Bonus", subtitle: "Senior Engineer", amount: "AED 5,000" }
             ].map((alert, i) => (
                <div key={i} className="flex justify-between items-center p-4 border border-slate-200 dark:border-white/10 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <div>
                    <h4 className="font-semibold text-sm">{alert.title}</h4>
                    <p className="text-xs text-slate-500">{alert.subtitle}</p>
                  </div>
                  <div className="text-right">
                    <span className="block font-bold text-slate-900 dark:text-orange-400">{alert.amount}</span>
                    <button className="text-xs text-orange-600 hover:text-orange-700 font-medium mt-1">Review</button>
                  </div>
                </div>
             ))}
           </div>
        </div>
      </div>
    </div>
  )
}
