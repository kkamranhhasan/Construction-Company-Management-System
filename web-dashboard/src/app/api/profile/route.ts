import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, email, currentPassword, newPassword } = body

    // Always fetch latest user to verify current password if they are changing it
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if email is already taken by someone else
    if (email && email !== user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email }
      })
      if (existingUser) {
        return NextResponse.json({ error: "Email is already in use" }, { status: 400 })
      }
    }

    const updateData: Record<string, string> = {
      name: name || user.name,
      email: email || user.email,
    }

    // Handle password change
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: "Current password is required to set a new password" }, { status: 400 })
      }
      
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password || "")
      if (!isPasswordValid) {
        return NextResponse.json({ error: "Invalid current password" }, { status: 400 })
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10)
      updateData.password = hashedPassword
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true
      }
    })

    return NextResponse.json({
        message: "Profile updated successfully", 
        user: updatedUser
    })

  } catch (error) {
    console.error("Profile update error:", error)
    return NextResponse.json(
      { error: "An error occurred while updating profile" },
      { status: 500 }
    )
  }
}
