"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  Briefcase, 
  CalendarCheck, 
  Banknote, 
  FileText, 
  Settings,
  HardHat,
  MonitorCheck,
  MessageSquare
} from "lucide-react"

type Role = string

interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  roles: Role[]
}

const navigation: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["OWNER", "ADMIN", "SUB_MANAGER", "WORKER"] },
  { name: "Company Profile", href: "/dashboard/company", icon: Building2, roles: ["OWNER", "ADMIN"] },
  { name: "Sites", href: "/dashboard/sites", icon: MonitorCheck, roles: ["OWNER", "ADMIN", "SUB_MANAGER"] },
  { name: "Projects", href: "/dashboard/projects", icon: Briefcase, roles: ["OWNER", "ADMIN"] },
  { name: "Workforce", href: "/dashboard/workers", icon: HardHat, roles: ["OWNER", "ADMIN", "SUB_MANAGER"] },
  { name: "Attendance", href: "/dashboard/attendance", icon: CalendarCheck, roles: ["OWNER", "ADMIN", "SUB_MANAGER", "WORKER"] },
  { name: "Payroll & Finance", href: "/dashboard/payroll", icon: Banknote, roles: ["OWNER", "ADMIN"] },
  { name: "My Salary", href: "/dashboard/salary", icon: Banknote, roles: ["WORKER"] },
  { name: "Documents", href: "/dashboard/documents", icon: FileText, roles: ["OWNER", "ADMIN", "WORKER", "SUB_MANAGER"] },
  { name: "Messages", href: "/dashboard/messages", icon: MessageSquare, roles: ["OWNER", "ADMIN", "WORKER", "SUB_MANAGER"] },
  { name: "Users & Access", href: "/dashboard/users", icon: Users, roles: ["OWNER", "ADMIN"] },
  { name: "Settings", href: "/dashboard/settings", icon: Settings, roles: ["OWNER", "ADMIN", "SUB_MANAGER", "WORKER"] },
]

export default function DashboardSidebar({ role }: { role: string }) {
  const pathname = usePathname()
  
  // Filter nav items based on user role
  const filteredNav = navigation.filter(item => item.roles.includes(role))

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950 h-full transition-all">
      <div className="h-20 flex items-center px-6 border-b border-slate-200 dark:border-white/10">
        <Link href="/" className="flex items-center gap-2">
          <Building2 className="w-7 h-7 text-orange-500" />
          <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">BuildCore<span className="text-orange-500">.</span></span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
        <div className="mb-4 px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {role.replace("_", " ")} MENU
        </div>
        
        {filteredNav.map((item) => {
          const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/dashboard")
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive 
                  ? "bg-orange-500/10 text-orange-600 dark:text-orange-400" 
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? "text-orange-500" : ""}`} />
              {item.name}
            </Link>
          )
        })}
      </div>

      <div className="p-4 border-t border-slate-200 dark:border-white/10">
        <div className="bg-slate-100 dark:bg-slate-900 rounded-xl p-4 text-sm">
          <p className="font-semibold dark:text-white">Help Center</p>
          <p className="text-slate-500 dark:text-slate-400 mt-1 mb-3 text-xs">Need assistance with the platform?</p>
          <button className="w-full py-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-white/5 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition">
            Contact Support
          </button>
        </div>
      </div>
    </aside>
  )
}
