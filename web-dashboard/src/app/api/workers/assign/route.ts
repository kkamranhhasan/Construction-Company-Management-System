import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !["OWNER", "ADMIN"].includes(session.user.role)) {
       return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { workerId, siteIds } = body

    if (!workerId || !Array.isArray(siteIds)) {
       return NextResponse.json({ error: "Invalid data provided" }, { status: 400 })
    }


    await prisma.$transaction(async (tx) => {
      await tx.workerSite.deleteMany({
        where: { workerId }
      })

      if (siteIds.length > 0) {
        await tx.workerSite.createMany({
          data: siteIds.map((siteId: string) => ({
            workerId,
            siteId
          }))
        })
      }
    })

    return NextResponse.json({ success: true, message: "Assignments updated" })
  } catch (error) {
    console.error("Assignment error:", error)
    return NextResponse.json({ error: "Failed to assign worker" }, { status: 500 })
  }
}
