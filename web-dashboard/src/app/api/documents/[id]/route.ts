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
     const { name, title, type, expiresAt, status } = body

     const updatedDocument = await prisma.document.update({
        where: { id },
        data: {
           title: title || name,
           type,
           status,
           expiresAt: expiresAt ? new Date(expiresAt) : null,
        }
     })

     return NextResponse.json(updatedDocument)
  } catch (error) {
     return NextResponse.json({ error: "Failed to update document" }, { status: 500 })
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

     await prisma.document.delete({
        where: { id }
     })

     return NextResponse.json({ success: true })
  } catch (error) {
     return NextResponse.json({ error: "Failed to delete document" }, { status: 500 })
  }
}
