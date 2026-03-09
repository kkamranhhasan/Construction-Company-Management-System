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
     if (!session?.user || !["OWNER", "ADMIN"].includes(session.user.role)) {
       return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
     }

     const resolvedParams = await params;
     const id = resolvedParams.id;

     const body = await request.json()
     const { name, location, isActive, subManagerId } = body

     const updatedSite = await prisma.site.update({
        where: { id },
        data: {
           name,
           location,
           isActive: isActive !== undefined ? isActive : true,
           subManagerId: subManagerId || null
        }
     })

     return NextResponse.json(updatedSite)
  } catch (error) {
     return NextResponse.json({ error: "Failed to update site" }, { status: 500 })
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

     await prisma.site.delete({
        where: { id }
     })

     return NextResponse.json({ success: true })
  } catch (error) {
     return NextResponse.json({ error: "Failed to delete site" }, { status: 500 })
  }
}
