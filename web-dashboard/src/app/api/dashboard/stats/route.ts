import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
     const session = await getServerSession(authOptions)
     if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

     // Aggregate system stats (simplified for the dashboard)
     let workersCount = 0;
     if (session.user.role === "WORKER") {
        const myProfile = await prisma.workerProfile.findUnique({ 
            where: { userId: session.user.id },
            include: { assignedSites: true }
        });
        if (myProfile && myProfile.assignedSites.length > 0) {
            const siteIds = myProfile.assignedSites.map(s => s.siteId);
            workersCount = await prisma.workerProfile.count({
                where: { assignedSites: { some: { siteId: { in: siteIds } } } }
            });
        }
     } else {
        workersCount = await prisma.workerProfile.count()
     }

     const sites = await prisma.site.count()
     const projects = await prisma.project.count({ where: { status: "ACTIVE" } })
     
     // Calculate Real Monthly Payroll (sum of payroll records this month)
     const now = new Date()
     const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
     
     const currentPayrollAggr = await prisma.payroll.aggregate({
         where: {
             createdAt: { gte: startOfMonth }
         },
         _sum: { totalAmount: true }
     })
     const monthlyPayrollTotal = currentPayrollAggr._sum.totalAmount || 0

     // Mock financial chart data for last 6 months but use real data for current month
     const months = ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"]
     const revenueData = months.map((m, index) => {
        // Last month index is current month
        if (index === 5) {
           return {
             name: m,
             revenue: Math.floor(Math.random() * 20000) + monthlyPayrollTotal * 1.5, // Mocked revenue relative to real expenses
             expenses: monthlyPayrollTotal || 5000 // Real expenses or tiny fallback
           }
        }
        return {
           name: m,
           revenue: Math.floor(Math.random() * 50000) + 50000,
           expenses: Math.floor(Math.random() * 30000) + 20000
        }
     })

     // Recent Activities (mocked up from various tables)
     const docs = await prisma.document.findMany({ take: 3, orderBy: { createdAt: 'desc' }, include: { uploader: { select: { name: true } } } })
     const recentAttendances = await prisma.attendance.findMany({ take: 3, orderBy: { clockIn: 'desc' }, include: { worker: { include: { user: { select: { name: true } } } } } })

     const activities = [
       ...docs.map(d => ({ id: d.id, icon: "DOCUMENT", title: `New Document Uploaded`, desc: `${d.title} uploaded by ${d.uploader?.name || 'System'}`, time: d.createdAt })),
       ...recentAttendances.map(a => ({ id: a.id, icon: "ATTENDANCE", title: `Worker Clock-In`, desc: `${a.worker?.user?.name} checked in`, time: a.clockIn || new Date() }))
     ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5)

     return NextResponse.json({
        kpis: {
          totalWorkers: workersCount,
          activeSites: sites,
          runningProjects: projects,
          monthlyPayroll: `$${monthlyPayrollTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        },
        chartData: revenueData,
        activities
     })
  } catch(error) {
     return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
