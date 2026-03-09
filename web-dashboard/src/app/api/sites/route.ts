import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    // If Sub-Manager, show only their assigned sites
    if (session.user.role === "SUB_MANAGER") {
       const sites = await prisma.site.findMany({
         where: { subManagerId: session.user.id },
         include: { _count: { select: { workers: true, projects: true } } }
       })
       return NextResponse.json(sites)
    }

    // Owner and Admin can see all sites
    const sites = await prisma.site.findMany({
      include: { 
        subManager: { select: { name: true, email: true } },
        _count: { select: { workers: true, projects: true } }
      },
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json(sites)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch sites" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !["OWNER", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, location, subManagerId } = body

    const newSite = await prisma.site.create({
      data: {
        name,
        location,
        subManagerId: subManagerId || null
      }
    })

    return NextResponse.json(newSite)
  } catch (error) {
    return NextResponse.json({ error: "Failed to create site" }, { status: 500 })
  }
}
