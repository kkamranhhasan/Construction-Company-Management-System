"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Users, HardHat, Building2, TrendingUp, AlertCircle, FileText, CheckCircle2, Clock, CalendarDays, Zap, ShieldCheck } from "lucide-react"

export default function EnhancedDashboard() {
  const { data: session } = useSession()
  const user = session?.user
  
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
     fetch("/api/dashboard/stats")
       .then(res => res.json())
       .then(data => setStats(data))
       .finally(() => setLoading(false))
  }, [])

  const getActivityIcon = (iconName: string) => {
     if (iconName === "DOCUMENT") return <FileText className="w-5 h-5 text-blue-500" />
     if (iconName === "ATTENDANCE") return <Clock className="w-5 h-5 text-emerald-500" />
     return <AlertCircle className="w-5 h-5 text-orange-500" />
  }

  const role = user?.role || "USER"

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-orange-500 text-white rounded-3xl p-8 relative overflow-hidden shadow-lg">
         {/* Background graphic */}
         <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -z-0 transform translate-x-1/3 -translate-y-1/3"></div>
         <div className="absolute bottom-0 right-32 w-48 h-48 bg-black/10 rounded-full blur-2xl -z-0"></div>
         
         <div className="relative z-10 w-full">
            <h1 className="text-4xl font-extrabold tracking-tight mb-2">Welcome back, {user?.name?.split(' ')[0] || "User"}!</h1>
            <p className="text-orange-100 font-medium flex items-center gap-2">
               <ShieldCheck className="w-5 h-5 text-orange-200" /> System {role.replace('_', ' ')} Dashboard
            </p>
         </div>
      </div>

      {loading ? (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-slate-100 dark:bg-slate-900 rounded-2xl animate-pulse"></div>
           ))}
         </div>
      ) : (
         <>
            {/* KPI STATS CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
               <StatCard 
                 title={role === "WORKER" ? "Site Workforce" : "Total Workforce"} 
                 value={stats?.kpis?.totalWorkers || "0"} 
                 icon={<HardHat className="w-6 h-6 text-orange-500" />}
                 trend={role === "WORKER" ? "On your sites" : "+12% this month"}
                 trendUp={true}
               />
               <StatCard 
                 title="Active Sites" 
                 value={stats?.kpis?.activeSites || "0"} 
                 icon={<Building2 className="w-6 h-6 text-blue-500" />}
                 trend="Operational"
                 trendUp={true}
               />
               <StatCard 
                 title="Running Projects" 
                 value={stats?.kpis?.runningProjects || "0"} 
                 icon={<Zap className="w-6 h-6 text-amber-500" />}
                 trend="On Schedule"
                 trendUp={true}
               />
               <StatCard 
                 title="Est. Monthly Payroll" 
                 value={stats?.kpis?.monthlyPayroll || "$0"} 
                 icon={<TrendingUp className="w-6 h-6 text-emerald-500" />}
                 trend="Pending Disbursal"
                 trendUp={false}
               />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
               {/* Financial Mock Chart */}
               <div className="lg:col-span-2 bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm relative overflow-hidden flex flex-col">
                  <h3 className="text-lg font-bold mb-6 flex items-center justify-between">
                     6-Month Financial Overview
                     <span className="text-xs font-semibold px-2 py-1 bg-slate-100 dark:bg-slate-900 rounded-lg text-slate-500">2026</span>
                  </h3>
                  
                  <div className="flex-1 flex items-end gap-2 md:gap-4 mt-auto min-h-[250px] relative px-4 text-xs font-semibold text-slate-400">
                     {/* Y-axis labels simplified */}
                     <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between pt-2 pb-6 w-10 text-right pr-2 border-r border-slate-100 dark:border-white/5 uppercase tracking-widest text-[10px]">
                        <span>$100k</span><span>$75k</span><span>$50k</span><span>$25k</span><span>$0</span>
                     </div>
                     
                     <div className="ml-12 flex-1 flex items-end justify-between h-full pt-8 pb-1 border-b border-slate-100 dark:border-white/5 relative z-10">
                        {stats?.chartData?.map((data: any) => {
                           // Scale out of $100k
                           const revenueHeight = `${(data.revenue / 100000) * 100}%`
                           const expenseHeight = `${(data.expenses / 100000) * 100}%`
                           
                           return (
                             <div key={data.name} className="flex flex-col items-center gap-2 group w-full px-1">
                                <div className="flex items-end justify-center w-full gap-1 h-[200px] relative">
                                   {/* Tooltip on hover */}
                                   <div className="absolute -top-12 opacity-0 group-hover:opacity-100 bg-slate-900 text-white text-[10px] py-1 px-2 rounded-lg whitespace-nowrap transition-opacity pointer-events-none z-20">
                                      Rev: ${(data.revenue/1000).toFixed(1)}k<br/>Exp: ${(data.expenses/1000).toFixed(1)}k
                                   </div>
                                   
                                   <div className="w-1/3 max-w-[1.5rem] bg-orange-500/80 rounded-t-sm group-hover:bg-orange-500 transition-all" style={{ height: revenueHeight }}></div>
                                   <div className="w-1/3 max-w-[1.5rem] bg-slate-200 dark:bg-slate-800 rounded-t-sm group-hover:bg-slate-300 dark:group-hover:bg-slate-700 transition-all" style={{ height: expenseHeight }}></div>
                                </div>
                                <span className="uppercase tracking-widest font-bold text-slate-500 dark:text-slate-400">{data.name}</span>
                             </div>
                           )
                        })}
                     </div>
                  </div>
                  
                  <div className="flex justify-center gap-6 mt-6 pt-4 border-t border-slate-100 dark:border-white/5">
                     <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                        <div className="w-3 h-3 rounded-sm bg-orange-500"></div> Total Revenue
                     </div>
                     <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                        <div className="w-3 h-3 rounded-sm bg-slate-200 dark:bg-slate-800"></div> Operating Expenses
                     </div>
                  </div>
               </div>

               {/* Activity Feed */}
               <div className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm flex flex-col">
                  <h3 className="text-lg font-bold mb-6 flex items-center justify-between">
                     Recent Activity
                     <button className="text-orange-500 text-sm hover:underline font-semibold">View All</button>
                  </h3>
                  
                  <div className="flex-1 space-y-6">
                     {stats?.activities?.length > 0 ? stats.activities.map((activity: any) => (
                        <div key={activity.id} className="flex gap-4 group">
                           <div className="relative">
                              <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-white/5 flex items-center justify-center group-hover:scale-110 group-hover:shadow-md transition-all z-10 relative">
                                 {getActivityIcon(activity.icon)}
                              </div>
                              <div className="absolute top-10 left-1/2 -ml-px w-px h-10 bg-slate-100 dark:bg-white/5 group-last:hidden"></div>
                           </div>
                           <div className="flex-1 pt-1">
                              <h4 className="font-semibold text-sm text-slate-900 dark:text-white leading-tight">{activity.title}</h4>
                              <p className="text-xs text-slate-500 mt-1 line-clamp-1">{activity.desc}</p>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-2 block flex items-center gap-1">
                                 <CalendarDays className="w-3 h-3" /> {new Date(activity.time).toLocaleTimeString()}
                              </span>
                           </div>
                        </div>
                     )) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-500">
                           <Clock className="w-8 h-8 text-slate-300 dark:text-slate-700 mb-2" />
                           <p className="text-sm font-medium">No recent activities found.</p>
                        </div>
                     )}
                  </div>
               </div>
            </div>
         </>
      )}
    </div>
  )
}

function StatCard({ title, value, icon, trend, trendUp }: { title: string, value: string | number, icon: React.ReactNode, trend: string, trendUp: boolean }) {
  return (
    <div className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm hover:shadow-md hover:border-orange-500/50 transition-all group cursor-pointer relative overflow-hidden">
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-slate-50 dark:bg-slate-900 rounded-full transition-all group-hover:scale-150 z-0"></div>
      
      <div className="relative z-10">
         <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-white dark:bg-slate-950 border border-slate-100 dark:border-white/5 rounded-2xl shadow-sm">
               {icon}
            </div>
         </div>
         <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1 group-hover:text-orange-500 transition-colors">{value}</h3>
         <p className="text-sm font-semibold text-slate-500">{title}</p>
         
         <div className="mt-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
            <span className={trendUp ? "text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded" : "text-slate-500 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded"}>
               {trend}
            </span>
         </div>
      </div>
    </div>
  )
}
