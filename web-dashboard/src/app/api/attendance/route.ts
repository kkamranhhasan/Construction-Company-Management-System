import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
     const session = await getServerSession(authOptions)
     if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

     const url = new URL(request.url)
     const dateStr = url.searchParams.get("date") || new Date().toISOString()
     const targetDate = new Date(dateStr)
     targetDate.setHours(0, 0, 0, 0)
     
     let attendances;

     if (session.user.role === "WORKER") {
        // Worker profiles check
        const profile = await prisma.workerProfile.findUnique({ where: { userId: session.user.id } })
        if (!profile) return NextResponse.json({ error: "Worker profile not found" }, { status: 404 })
        
        attendances = await prisma.attendance.findMany({
            where: { workerId: profile.id },
            include: { site: true },
            orderBy: { date: 'desc' },
            take: 30
        })
     } else if (session.user.role === "SUB_MANAGER") {
        const mySites = await prisma.site.findMany({ where: { subManagerId: session.user.id } })
        const siteIds = mySites.map(s => s.id)
        
        attendances = await prisma.attendance.findMany({
            where: { siteId: { in: siteIds }, date: targetDate },
            include: { worker: { include: { user: true } }, site: true }
        })
     } else {
        // Admin and Owner see all attendance for a date
        attendances = await prisma.attendance.findMany({
            where: { date: targetDate },
            include: { worker: { include: { user: true } }, site: true }
        })
     }

     return NextResponse.json(attendances)
  } catch (error) {
     return NextResponse.json({ error: "Failed to fetch attendance" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
     const session = await getServerSession(authOptions)
     if (!session?.user || !["WORKER", "SUB_MANAGER"].includes(session.user.role)) {
       return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
     }

     const body = await request.json()
     const { siteId, type, gps, photo } = body // type: 'CLOCK_IN' or 'CLOCK_OUT'

     const profile = await prisma.workerProfile.findUnique({ where: { userId: session.user.id } })
     if (!profile) return NextResponse.json({ error: "Worker profile not found" }, { status: 404 })

     const today = new Date()
     today.setHours(0, 0, 0, 0)

     // Find existing attendance for today
     let record = await prisma.attendance.findUnique({
         where: { workerId_date: { workerId: profile.id, date: today } }
     })

     if (type === 'CLOCK_IN') {
         if (record && record.clockIn) return NextResponse.json({ error: "Already clocked in today" }, { status: 400 })
         
         const now = new Date()
         // Allow within defined time window checking could go here (e.g. 6AM to 9AM)
         const hour = now.getHours()
         const status = hour > 8 ? "LATE" : "PRESENT" // Basic late logic

         if (record) {
             record = await prisma.attendance.update({
                 where: { id: record.id },
                 data: { clockIn: now, clockInGps: gps, clockInPhoto: photo, status, siteId }
             })
         } else {
             record = await prisma.attendance.create({
                 data: { workerId: profile.id, siteId, date: today, clockIn: now, clockInGps: gps, clockInPhoto: photo, status }
             })
         }
     } else if (type === 'CLOCK_OUT') {
         if (!record || !record.clockIn) return NextResponse.json({ error: "Must clock in first" }, { status: 400 })
         if (record.clockOut) return NextResponse.json({ error: "Already clocked out today" }, { status: 400 })
         
         record = await prisma.attendance.update({
             where: { id: record.id },
             data: { clockOut: new Date(), clockOutGps: gps, clockOutPhoto: photo }
         })
     }

     return NextResponse.json(record)
  } catch (error) {
     return NextResponse.json({ error: "Failed to process attendance" }, { status: 500 })
  }
}
