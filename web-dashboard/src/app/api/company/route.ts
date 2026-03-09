import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const company = await prisma.company.findFirst()
    return NextResponse.json(company || {})
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch company" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !["OWNER", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, tradeLicense, registrationNumber, address, contactPhone, contactEmail } = body

    // Check if company exists
    const existingCompany = await prisma.company.findFirst()

    if (existingCompany) {
      const updated = await prisma.company.update({
        where: { id: existingCompany.id },
        data: { name, tradeLicense, registrationNumber, address, contactPhone, contactEmail },
      })
      return NextResponse.json(updated)
    } else {
      const newCompany = await prisma.company.create({
        data: { name, tradeLicense, registrationNumber, address, contactPhone, contactEmail },
      })
      return NextResponse.json(newCompany)
    }
  } catch (error) {
    return NextResponse.json({ error: "Failed to save company information" }, { status: 500 })
  }
}
