"use client"

import { MapPin, Users, Camera, AlertCircle } from "lucide-react"

export function SubManagerDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Field Manager Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-orange-500 text-white p-6 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-orange-100">My Assigned Site</h3>
            <MapPin className="w-5 h-5 text-orange-200" />
          </div>
          <p className="text-2xl font-bold">Downtown Tower</p>
          <p className="text-sm text-orange-200 mt-2">Active phase: Foundation laying</p>
        </div>
        
        <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-slate-500">Site Workforce</h3>
            <Users className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-3xl font-bold">142</p>
          <p className="text-sm text-slate-500 mt-2">Workers assigned today</p>
        </div>

        <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-slate-500">Present Today</h3>
            <Camera className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-3xl font-bold text-emerald-600">128</p>
          <p className="text-sm text-slate-500 mt-2">14 absent or late</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Quick Actions</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <button className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-xl hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-slate-800 transition group">
              <Camera className="w-8 h-8 text-slate-400 group-hover:text-orange-500 mb-3 transition-colors" />
              <span className="font-medium text-slate-700 dark:text-slate-300">Log Attendance</span>
              <span className="text-xs text-slate-500 mt-1">Manual Photo Capture</span>
            </button>
            <button className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-xl hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-slate-800 transition group">
              <AlertCircle className="w-8 h-8 text-slate-400 group-hover:text-orange-500 mb-3 transition-colors" />
              <span className="font-medium text-slate-700 dark:text-slate-300">Report Issue</span>
              <span className="text-xs text-slate-500 mt-1">Log safety incident</span>
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
           <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Today's Exceptions</h3>
           <div className="space-y-3">
             <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-500/10 rounded-lg">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500">M</div>
                 <div>
                   <p className="font-medium text-sm text-slate-900 dark:text-white">Mohammed A.</p>
                   <p className="text-xs text-red-600">Absent (Unexcused)</p>
                 </div>
               </div>
               <button className="text-xs px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-md hover:bg-slate-50 transition">Review</button>
             </div>
           </div>
        </div>
      </div>
    </div>
  )
}
