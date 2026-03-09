import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || !["OWNER", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { name, email, password, role } = body

    // Cannot demote/change the only OWNER (or an OWNER if you are an ADMIN)
    const targetUser = await prisma.user.findUnique({ where: { id } })
    if (!targetUser) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (targetUser.role === "OWNER" && session.user.role !== "OWNER") {
        return NextResponse.json({ error: "Only an OWNER can modify another OWNER" }, { status: 403 })
    }
    
    // Admins cannot modify other admins
    if (targetUser.role === "ADMIN" && session.user.role !== "OWNER") {
        return NextResponse.json({ error: "Only an OWNER can modify an ADMIN" }, { status: 403 })
    }

    // Admins cannot promote people to admin
    if (role && ["OWNER", "ADMIN"].includes(role) && session.user.role !== "OWNER") {
        return NextResponse.json({ error: "Only an OWNER can promote users to ADMIN or OWNER" }, { status: 403 })
    }

    const updateData: Record<string, string> = { name, email, role }

    if (password) {
      updateData.password = await bcrypt.hash(password, 10)
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    })

    if (role === "WORKER" && targetUser.role !== "WORKER") {
        const existingProfile = await prisma.workerProfile.findUnique({ where: { userId: id } })
        if (!existingProfile) {
            await prisma.workerProfile.create({
                data: {
                    userId: id,
                    jobTitle: "Reassigned",
                    dailyWage: 0
                }
            })
        }
    }

    return NextResponse.json(user)

  } catch (error) {
    console.error("Update user error:", error)
    return NextResponse.json(
      { error: "An error occurred while updating user" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || !["OWNER", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    if (id === session.user.id) {
        return NextResponse.json({ error: "You cannot delete yourself" }, { status: 400 })
    }

    const targetUser = await prisma.user.findUnique({ where: { id } })
    
    if (!targetUser) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (targetUser.role === "OWNER" && session.user.role !== "OWNER") {
        return NextResponse.json({ error: "Only an OWNER can delete an OWNER" }, { status: 403 })
    }
    
    // Admins cannot delete other admins
    if (targetUser.role === "ADMIN" && session.user.role !== "OWNER") {
        return NextResponse.json({ error: "Only an OWNER can delete an ADMIN" }, { status: 403 })
    }
    
    await prisma.user.delete({
      where: { id }
    })

    return NextResponse.json({ message: "User deleted successfully" })
  } catch (error: unknown) {
    console.error("Delete user error:", error)
    // Check if it's a constraint error (user has related records)
    if (typeof error === 'object' && error !== null && 'code' in error && (error as {code: string}).code === 'P2003') {
        return NextResponse.json({ error: "Cannot delete user. There are related records attached to this user." }, { status: 400 })
    }
    return NextResponse.json(
      { error: "An error occurred while deleting user" },
      { status: 500 }
    )
  }
}
