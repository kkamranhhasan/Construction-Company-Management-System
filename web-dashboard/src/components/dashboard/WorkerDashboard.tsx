"use client"

import { Clock, Wallet, MapPin, SearchCheck } from "lucide-react"

export function WorkerDashboard() {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-8 rounded-3xl text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-3xl rounded-full" />
        <div className="relative z-10 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Hello, John Doe</h1>
            <p className="text-orange-100 font-medium">Senior Mason • ID: 784-1234-567890-1</p>
          </div>
          <div className="hidden sm:block text-right bg-black/20 p-4 rounded-xl backdrop-blur-md">
            <p className="text-sm text-orange-100">Current Assignment</p>
            <p className="font-bold text-lg flex items-center gap-2 mt-1">
              <MapPin className="w-5 h-5 text-orange-200" /> Downtown Tower
            </p>
          </div>
        </div>
      </div>

      {/* Grid Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
          <div className="flex gap-4 items-center">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl text-emerald-500">
              <SearchCheck className="w-8 h-8" />
            </div>
            <div>
              <p className="text-slate-500 font-medium mb-1">Status Today</p>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Clocked In</h2>
              <p className="text-sm text-emerald-600 mt-1 font-medium flex items-center gap-1">
                <Clock className="w-4 h-4" /> 07:45 AM
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm flex items-center justify-between">
          <div className="flex gap-4 items-center">
            <div className="p-4 bg-blue-50 dark:bg-blue-500/10 rounded-2xl text-blue-500">
              <Wallet className="w-8 h-8" />
            </div>
            <div>
              <p className="text-slate-500 font-medium mb-1">Est. Monthly Earnings</p>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">AED 3,200</h2>
              <p className="text-sm text-slate-500 mt-1 flex items-center gap-1">
                22 Days worked this month
              </p>
            </div>
          </div>
          <button className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition hidden sm:block">
            View Details
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm mt-8">
        <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Recent Attendance Logs</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/10">
                <th className="py-3 px-4 font-semibold text-sm text-slate-500">Date</th>
                <th className="py-3 px-4 font-semibold text-sm text-slate-500">Site</th>
                <th className="py-3 px-4 font-semibold text-sm text-slate-500">Clock In</th>
                <th className="py-3 px-4 font-semibold text-sm text-slate-500">Clock Out</th>
                <th className="py-3 px-4 font-semibold text-sm text-slate-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                { date: "Oct 24, 2024", site: "Downtown Tower", in: "07:45 AM", out: "--:--", status: "Present" },
                { date: "Oct 23, 2024", site: "Downtown Tower", in: "07:50 AM", out: "06:15 PM", status: "Present" },
                { date: "Oct 22, 2024", site: "Downtown Tower", in: "08:15 AM", out: "06:00 PM", status: "Late" },
              ].map((row, i) => (
                <tr key={i} className="border-b border-slate-100 dark:border-white/5 last:border-none">
                   <td className="py-3 px-4 text-sm text-slate-900 dark:text-slate-300">{row.date}</td>
                   <td className="py-3 px-4 text-sm text-slate-700 dark:text-slate-400">{row.site}</td>
                   <td className="py-3 px-4 text-sm font-medium text-emerald-600 dark:text-emerald-400">{row.in}</td>
                   <td className="py-3 px-4 text-sm text-slate-700 dark:text-slate-400">{row.out}</td>
                   <td className="py-3 px-4">
                     <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${row.status === 'Present' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-400'}`}>
                       {row.status}
                     </span>
                   </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
