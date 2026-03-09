import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
     const session = await getServerSession(authOptions)
     if (!session?.user?.id || !["OWNER", "ADMIN"].includes(session.user.role)) {
       return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
     }

     const { id } = await params
     const body = await request.json()
     const { name, email, emiratesId, phone, nationality, jobTitle, skillCategory, dailyWage } = body

     // Update User model data
     await prisma.user.update({
        where: { id },
        data: {
           name,
           email: email || undefined
        }
     })

     // Update WorkerProfile model data
     const updatedWorker = await prisma.workerProfile.update({
        where: { userId: id },
        data: {
           emiratesId,
           phone,
           nationality,
           jobTitle,
           skillCategory,
           dailyWage: parseFloat(dailyWage) || 0
        },
        include: {
           user: { select: { name: true, email: true, image: true } },
           assignedSites: { include: { site: { select: { name: true, location: true } } } }
        }
     })

     return NextResponse.json(updatedWorker)
  } catch (error) {
     return NextResponse.json({ error: "Failed to update worker" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
     const session = await getServerSession(authOptions)
     if (!session?.user?.id || !["OWNER", "ADMIN"].includes(session.user.role)) {
       return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
     }

     const { id } = await params

     // Delete logic: The Prisma schema has Cascade delete on WorkerProfile when User is deleted.
     // So we can just delete the User record.
     await prisma.user.delete({
        where: { id }
     })

     return NextResponse.json({ success: true })
  } catch (error) {
     return NextResponse.json({ error: "Failed to delete worker" }, { status: 500 })
  }
}
