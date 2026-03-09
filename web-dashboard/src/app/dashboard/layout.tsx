import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import DashboardSidebar from "@/components/layout/DashboardSidebar"
import DashboardHeader from "@/components/layout/DashboardHeader"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/login")
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50">
      <DashboardSidebar role={session.user.role} />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <DashboardHeader user={session.user} />
        
        <main className="flex-1 overflow-y-auto bg-slate-100/50 dark:bg-slate-900/50 p-6 md:p-8">
          <div className="w-full max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
