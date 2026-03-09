import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Public endpoint: Does not require authentication
// Retrieves strictly non-sensitive data for the landing page
export async function GET() {
  try {
    // 1. Fetch Company Details (Always get the first registered company)
    const company = await prisma.company.findFirst({
        select: {
            name: true,
            address: true,
            contactPhone: true,
            contactEmail: true,
            tradeLicense: true, // Only exposing license number if public trust requires it
        }
    })

    // 2. Fetch Latest 5 "ACTIVE" or "COMPLETED" Projects for the Timeline
    const recentProjects = await prisma.project.findMany({
        where: {
            status: { in: ["ACTIVE", "COMPLETED"] }
        },
        orderBy: {
            actualCompletion: 'desc', // Will sort completed projects first, or rely on start date fallback
        },
        take: 5,
        select: {
            id: true,
            name: true,
            location: true,
            startDate: true,
            status: true,
            actualCompletion: true,
            // DO NOT include budget, project managers, or internal docs.
        }
    })

    // 3. Fallback metrics if DB is empty for a brand new system
    const publicStats = {
        totalProjects: await prisma.project.count(),
        totalSites: await prisma.site.count(),
    }

    return NextResponse.json({
        company: company || {
            name: "BuildCore Construction",
            address: "123 Business Avenue, City",
            contactPhone: "+1 (555) 000-0000",
            contactEmail: "contact@buildcore.com"
        },
        updates: recentProjects,
        stats: publicStats
    })

  } catch(error) {
    console.error("Public API Error:", error)
    return NextResponse.json({ error: "Failed to fetch public data" }, { status: 500 })
  }
}
