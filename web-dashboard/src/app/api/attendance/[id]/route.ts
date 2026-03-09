import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
     const session = await getServerSession(authOptions)
     if (!session?.user || !["OWNER", "ADMIN", "SUB_MANAGER"].includes(session.user.role)) {
       return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
     }

     const resolvedParams = await params;
     const id = resolvedParams.id;

     const body = await request.json()
     const { status, clockIn, clockOut, date } = body

     const updatedAttendance = await prisma.attendance.update({
        where: { id },
        data: {
           status,
           date: date ? new Date(date) : undefined,
           clockIn: clockIn ? new Date(clockIn) : null,
           clockOut: clockOut ? new Date(clockOut) : null,
        }
     })

     return NextResponse.json(updatedAttendance)
  } catch (error) {
     return NextResponse.json({ error: "Failed to update attendance record" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
     const session = await getServerSession(authOptions)
     if (!session?.user || !["OWNER", "ADMIN"].includes(session.user.role)) {
       return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
     }

     const resolvedParams = await params;
     const id = resolvedParams.id;

     await prisma.attendance.delete({
        where: { id }
     })

     return NextResponse.json({ success: true })
  } catch (error) {
     return NextResponse.json({ error: "Failed to delete attendance record" }, { status: 500 })
  }
}
