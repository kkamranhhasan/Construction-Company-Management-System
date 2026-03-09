import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
     const session = await getServerSession(authOptions)
     if (!session?.user) {
       return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
     }

     const { searchParams } = new URL(request.url)
     const contactId = searchParams.get('userId')
     
     if (!contactId) {
         return NextResponse.json({ error: "Contact ID required" }, { status: 400 })
     }

     const messages = await prisma.message.findMany({
         where: {
             OR: [
                 { senderId: session.user.id, receiverId: contactId },
                 { senderId: contactId, receiverId: session.user.id }
             ]
         },
         orderBy: { createdAt: 'asc' },
         include: {
             sender: { select: { id: true, name: true, image: true, role: true } },
             receiver: { select: { id: true, name: true, image: true, role: true } }
         }
     });

     // Mark received messages as read
     const unreadIds = messages
        .filter(m => m.receiverId === session.user.id && !m.isRead)
        .map(m => m.id);
        
     if (unreadIds.length > 0) {
        await prisma.message.updateMany({
            where: { id: { in: unreadIds } },
            data: { isRead: true }
        });
     }

     return NextResponse.json(messages)
  } catch(error: unknown) {
     return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
     const session = await getServerSession(authOptions)
     if (!session?.user) {
       return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
     }

     const contentType = request.headers.get("content-type") || "";
     let receiverId: string;
     let content: string | null = null;
     let fileUrl: string | null = null;
     let fileType: string | null = null;
     let fileName: string | null = null;
     let latitude: number | null = null;
     let longitude: number | null = null;

     if (contentType.includes("multipart/form-data")) {
        const formData = await request.formData();
        receiverId = formData.get("receiverId") as string;
        content = formData.get("content") as string || "";
        
        const file = formData.get("file") as File | null;
        if (file && file.size > 0) { // Check if file exists and is not empty
           // Simulate saving file to external storage (S3, Cloudinary, etc.)
           fileName = file.name;
           fileType = file.type.split('/')[0]; // 'image', 'video', 'audio'
           const ext = file.name.split('.').pop() || 'bin';
           // Mock URL for demonstration
           fileUrl = `https://storage.buildcore.app/messages/${Date.now()}-${Math.random().toString(36).substr(2, 6)}.${ext}`;
        }

        // Live Location data
        const latStr = formData.get("latitude") as string | null;
        const lonStr = formData.get("longitude") as string | null;
        latitude = latStr ? parseFloat(latStr) : null;
        longitude = lonStr ? parseFloat(lonStr) : null;

     } else {
         const json = await request.json();
         receiverId = json.receiverId;
         content = json.content;
         fileUrl = json.fileUrl || null;
         fileType = json.fileType || null;
         fileName = json.fileName || null;
         latitude = json.latitude || null;
         longitude = json.longitude || null;
     }
     
     if (!receiverId || (!content && !fileUrl && !latitude && !longitude)) {
         return NextResponse.json({ error: "Message must contain text, a file, or location data" }, { status: 400 })
     }
     
     const message = await prisma.message.create({
         data: {
             senderId: session.user.id,
             receiverId,
             content: content || "",
             fileUrl,
             fileType,
             fileName,
             latitude,
             longitude,
             isDelivered: true,
         },
         include: {
             sender: { select: { id: true, name: true, image: true, role: true } },
             receiver: { select: { id: true, name: true, image: true, role: true } }
         }
     });

     return NextResponse.json(message)
  } catch(error: unknown) {
     return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}
