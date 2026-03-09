import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || !["OWNER", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let whereClause = {};
    if (session.user.role === "ADMIN") {
        whereClause = { role: { in: ["SUB_MANAGER", "WORKER"] } };
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error("Fetch users error:", error)
    return NextResponse.json(
      { error: "An error occurred while fetching users" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || !["OWNER", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, email, password, role } = body

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (session.user.role === "ADMIN" && !["SUB_MANAGER", "WORKER"].includes(role)) {
       return NextResponse.json({ error: "Admins can only create Sub-Managers and Workers" }, { status: 403 })
    }

    const userExists = await prisma.user.findUnique({
      where: { email }
    })

    if (userExists) {
      return NextResponse.json({ error: "User already exists with this email" }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const createData: any = {
      name,
      email,
      password: hashedPassword,
      role: role
    }

    if (role === "WORKER") {
      createData.workerProfile = {
        create: {
          jobTitle: "Unassigned",
          dailyWage: 0
        }
      }
    }

    const user = await prisma.user.create({
      data: createData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    })

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    console.error("Create user error:", error)
    return NextResponse.json(
      { error: "An error occurred while creating user" },
      { status: 500 }
    )
  }
}
