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

    // Role-based visibility
    let workers;
    if (session.user.role === "SUB_MANAGER") {
        // Sub-managers see workers assigned to their sites
        const mySites = await prisma.site.findMany({ where: { subManagerId: session.user.id } })
        const siteIds = mySites.map(s => s.id)
        
        workers = await prisma.workerProfile.findMany({
            where: {
                OR: [
                    { assignedSites: { some: { siteId: { in: siteIds } } } },
                    { assignedSites: { none: {} } }
                ]
            },
            include: { user: { select: { name: true, email: true } }, assignedSites: { include: { site: true } } },
            orderBy: { createdAt: 'desc' }
        })
    } else {
        // Admin and Owner see all workers
        workers = await prisma.workerProfile.findMany({
            include: { user: { select: { name: true, email: true } }, assignedSites: { include: { site: true } } },
            orderBy: { createdAt: 'desc' }
        })
    }

    return NextResponse.json(workers)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch workers" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !["OWNER", "ADMIN"].includes(session.user.role)) {
       return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, email, emiratesId, phone, nationality, jobTitle, skillCategory, dailyWage } = body

    // Example logic to create the base user and then the embedded profile
    // Typically you might generate a random password or use a specific flow for workers
    const newUser = await prisma.user.create({
        data: {
            name,
            email,
            role: "WORKER",
            // In reality hash a temp password, setting placeholder
            password: "hashedPasswordPlaceholder123",
            workerProfile: {
                create: {
                    emiratesId,
                    phone,
                    nationality,
                    jobTitle,
                    skillCategory,
                    dailyWage: parseFloat(dailyWage || "0"),
                }
            }
        },
        include: { workerProfile: true }
    })

    return NextResponse.json(newUser)
  } catch (error) {
    return NextResponse.json({ error: "Failed to create worker profile" }, { status: 500 })
  }
}
