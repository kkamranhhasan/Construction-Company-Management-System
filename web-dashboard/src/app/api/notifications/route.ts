import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// Get all notifications for the logged-in user
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const notifications = await prisma.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 20 // Only show 20 most recent
    })

    return NextResponse.json(notifications)
  } catch (error) {
    console.error("Fetch notifications error:", error)
    return NextResponse.json(
      { error: "An error occurred while fetching notifications" },
      { status: 500 }
    )
  }
}

// Create a new notification (Admins, System)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only allow Admins or Owners to trigger manual notifications
    // In reality, this endpoint might be called by internal system hooks.
    if (!["OWNER", "ADMIN"].includes(session.user.role)) {
       return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const body = await request.json()
    const { userId, title, message, type, link } = body

    if (!userId || !title || !message) {
       return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }

    const notif = await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type: type || "INFO",
        link: link || null
      }
    })

    return NextResponse.json(notif)
  } catch (error) {
    console.error("Create notification error:", error)
    return NextResponse.json(
      { error: "An error occurred while creating notification" },
      { status: 500 }
    )
  }
}

// Mark notifications as read
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { notificationIds } = body

    if (!notificationIds || !Array.isArray(notificationIds)) {
       return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
    }

    await prisma.notification.updateMany({
      where: {
        id: { in: notificationIds },
        userId: session.user.id // Security check to ensure they own the notif
      },
      data: { isRead: true }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Update notification error:", error)
    return NextResponse.json(
      { error: "An error occurred while updating notifications" },
      { status: 500 }
    )
  }
}
