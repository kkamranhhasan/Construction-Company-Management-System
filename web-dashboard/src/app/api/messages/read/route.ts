import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(request: Request) {
  try {
     const session = await getServerSession(authOptions)
     if (!session?.user) {
       return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
     }

     const { messageIds } = await request.json()

     if (!messageIds || !Array.isArray(messageIds) || messageIds.length === 0) {
         return NextResponse.json({ error: "No message IDs provided" }, { status: 400 })
     }

     // Update messages to be read, setting the readAt timestamp
     // We only update messages where the current user is the receiver
     await prisma.message.updateMany({
         where: { 
             id: { in: messageIds },
             receiverId: session.user.id,
             readAt: null // only update those that haven't been read yet
         },
         data: { 
             isRead: true,
             readAt: new Date()
         }
     });

     return NextResponse.json({ success: true })
  } catch(error: unknown) {
     console.error("Failed to mark messages as read:", error)
     return NextResponse.json({ error: "Failed to mark messages as read" }, { status: 500 })
  }
}
