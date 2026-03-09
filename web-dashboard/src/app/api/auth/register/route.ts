import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, phone, password, role } = body

    if (!name || (!email && !phone) || !password || !role) {
      return NextResponse.json({ error: "Missing required fields: A name, password, role, and either an email or phone number is required." }, { status: 400 })
    }

    if (!["OWNER", "WORKER"].includes(role)) {
       return NextResponse.json({ error: "Only Owner and Worker roles can self-register." }, { status: 403 })
    }

    if (role === "OWNER") {
       const existingOwner = await prisma.user.findFirst({ where: { role: "OWNER" } })
       if (existingOwner) {
          return NextResponse.json({ error: "An Company Owner is already registered to this system." }, { status: 403 })
       }
    }

    // Check if user exists (by email OR phone)
    const existingUser = await prisma.user.findFirst({
      where: { 
         OR: [
             ...(email ? [{ email }] : []),
             ...(phone ? [{ phone }] : [])
         ]
      },
    })

    if (existingUser) {
      if (email && existingUser.email === email) {
          return NextResponse.json({ error: "Email already registered" }, { status: 400 })
      }
      if (phone && existingUser.phone === phone) {
          return NextResponse.json({ error: "Phone number already registered" }, { status: 400 })
      }
      return NextResponse.json({ error: "Identifier already registered" }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const createData: any = {
        name,
        password: hashedPassword,
        role: role,
    }
    if (email) createData.email = email;
    if (phone) createData.phone = phone;
    
    if (role === "WORKER") {
        createData.workerProfile = {
            create: { jobTitle: "Pending Assignment", dailyWage: 0 }
        }
    }

    const user = await prisma.user.create({
      data: createData,
    })

    return NextResponse.json({
        message: "User registered successfully",
        user: { id: user.id, name: user.name, email: user.email, role: user.role }
    }, { status: 201 })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
