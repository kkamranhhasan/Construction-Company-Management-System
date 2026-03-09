import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
     const session = await getServerSession(authOptions)
     if (!session?.user || !["OWNER", "ADMIN", "SUB_MANAGER"].includes(session.user.role)) {
       return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
     }

     let projects;
     if (session.user.role === "SUB_MANAGER") {
        // Find projects for sites the sub-manager manages
        projects = await prisma.project.findMany({
           where: { site: { subManagerId: session.user.id } },
           include: { site: { select: { name: true } }, projectManager: { select: { name: true } } },
           orderBy: { expectedCompletion: 'asc' }
        })
     } else {
        projects = await prisma.project.findMany({
           include: { site: { select: { name: true } }, projectManager: { select: { name: true } } },
           orderBy: { expectedCompletion: 'asc' }
        })
     }

     return NextResponse.json(projects)
  } catch (error) {
     return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
     const session = await getServerSession(authOptions)
     if (!session?.user || !["OWNER", "ADMIN"].includes(session.user.role)) {
       return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
     }

     const body = await request.json()
     const { name, location, startDate, expectedCompletion, siteId, projectManagerId, status } = body

     const newProject = await prisma.project.create({
        data: {
           name,
           location,
           startDate: new Date(startDate),
           expectedCompletion: expectedCompletion ? new Date(expectedCompletion) : null,
           status: status || "PLANNING",
           siteId,
           projectManagerId: projectManagerId || null
        }
     })

     return NextResponse.json(newProject)
  } catch (error) {
     return NextResponse.json({ error: "Failed to create project" }, { status: 500 })
  }
}
