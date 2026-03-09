import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // Note: params is a promise in Next.js 15+ App Router for dynamic routes if not awaited, but we typically destructure. Next.js 14 it's not a promise. Let's use standard Next.js 14 signature since we're unsure, or await it. Actually, in Next.js 13/14, `params` is an object. In Next.js 15 it's a promise. Let's assume 14 format, but it's safe to use standard.
) {
  try {
     const session = await getServerSession(authOptions)
     if (!session?.user || !["OWNER", "ADMIN"].includes(session.user.role)) {
       return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
     }

     const resolvedParams = await params;
     const id = resolvedParams.id;

     const body = await request.json()
     const { name, location, startDate, expectedCompletion, status, projectManagerId, siteId } = body

     const updatedProject = await prisma.project.update({
        where: { id },
        data: {
           name,
           location,
           startDate: startDate ? new Date(startDate) : undefined,
           expectedCompletion: expectedCompletion ? new Date(expectedCompletion) : null,
           status,
           siteId,
           projectManagerId: projectManagerId || null
        }
     })

     return NextResponse.json(updatedProject)
  } catch (error) {
     return NextResponse.json({ error: "Failed to update project" }, { status: 500 })
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

     await prisma.project.delete({
        where: { id }
     })

     return NextResponse.json({ success: true })
  } catch (error) {
     return NextResponse.json({ error: "Failed to delete project" }, { status: 500 })
  }
}
