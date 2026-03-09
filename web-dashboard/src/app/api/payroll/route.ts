import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
     const session = await getServerSession(authOptions)
     if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

     let payrolls;

     if (session.user.role === "WORKER") {
        const profile = await prisma.workerProfile.findUnique({ where: { userId: session.user.id } })
        if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 })

        payrolls = await prisma.payroll.findMany({
           where: { workerId: profile.id },
           orderBy: { periodStart: 'desc' }
        })
     } else if (["OWNER", "ADMIN"].includes(session.user.role)) {
        payrolls = await prisma.payroll.findMany({
           include: { worker: { include: { user: true } }, paymentRequest: true },
           orderBy: { periodStart: 'desc' }
        })
     } else {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
     }

     return NextResponse.json(payrolls)
  } catch(error) {
     return NextResponse.json({ error: "Failed to fetch payroll data" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
     const session = await getServerSession(authOptions)
     if (!session?.user || !["OWNER", "ADMIN"].includes(session.user.role)) {
       return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
     }

     const body = await request.json()
     const { action, payrollId, periodStart, periodEnd } = body

     if (action === "GENERATE_BATCH") {
         if (!periodStart || !periodEnd) {
             return NextResponse.json({ error: "Missing period dates" }, { status: 400 })
         }

         const startDate = new Date(periodStart)
         const endDate = new Date(periodEnd)

         const workers = await prisma.workerProfile.findMany()
         const generated = []

         for (const worker of workers) {
             // Query actual attendance within the period
             const attendances = await prisma.attendance.findMany({
                 where: {
                     workerId: worker.id,
                     date: {
                         gte: startDate,
                         lte: endDate
                     },
                     status: { in: ["PRESENT", "LATE", "HALF_DAY"] }
                 }
             })

             // Calculate actual working days
             let workingDays = 0;
             for (const record of attendances) {
                 if (record.status === "HALF_DAY") workingDays += 0.5
                 else workingDays += 1
             }

             if (workingDays === 0) continue; // Skip generating zero-balance payrolls

             const baseSalary = workingDays * worker.dailyWage
             const allowances = 150 // Static mockup allowance
             const totalAmount = baseSalary + allowances

             // Delete existing drafted payrolls for this exact period to allow re-generation
             await prisma.payroll.deleteMany({
                 where: { workerId: worker.id, periodStart: startDate, periodEnd: endDate, status: "DRAFT" }
             })

             const p = await prisma.payroll.create({
                 data: {
                    workerId: worker.id,
                    periodStart: startDate,
                    periodEnd: endDate,
                    workingDays,
                    baseSalary,
                    allowances,
                    totalAmount,
                    status: "DRAFT"
                 }
             })
             generated.push(p)
         }
         return NextResponse.json({ count: generated.length, message: "Batch Generated based on Attendance" })
     }

     if (action === "SUBMIT_APPROVAL" && payrollId) {
         const payroll = await prisma.payroll.update({
             where: { id: payrollId },
             data: { status: "SUBMITTED" }
         })
         await prisma.paymentRequest.create({
             data: { payrollId, requestedById: session.user.id }
         })

         // Notify Owners
         const owners = await prisma.user.findMany({ where: { role: "OWNER" } })
         if (owners.length > 0) {
             await prisma.notification.createMany({
                 data: owners.map(o => ({
                     userId: o.id,
                     title: "Payroll Approval Required",
                     message: "A new payroll batch has been submitted and is pending your approval.",
                     type: "WARNING",
                     link: "/dashboard/payroll"
                 }))
             })
         }

         return NextResponse.json(payroll)
     }

     return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch(error) {
     return NextResponse.json({ error: "Failed to process payroll" }, { status: 500 })
  }
}
