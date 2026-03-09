import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
     const session = await getServerSession(authOptions)
     if (!session?.user || !["OWNER", "ADMIN", "SUB_MANAGER", "WORKER"].includes(session.user.role)) {
       return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
     }

     let documents;

     if (session.user.role === "WORKER") {
        documents = await prisma.document.findMany({
           where: { 
               OR: [
                   { uploaderId: session.user.id },
                   { recipientId: session.user.id },
                   { targetRole: "ALL WORKERS" },
                   { targetRole: "ALL" }
               ]
           },
           orderBy: { createdAt: 'desc' },
           include: { uploader: { select: { name: true, image: true } }, recipient: { select: { name: true, image: true } } }
        })
     } else if (session.user.role === "SUB_MANAGER") {
        documents = await prisma.document.findMany({
           where: {
               OR: [
                   { uploaderId: session.user.id },
                   { recipientId: session.user.id },
                   { targetRole: "ALL SUBMANAGERS" },
                   { targetRole: "ALL" }
               ]
           },
           orderBy: { createdAt: 'desc' },
           include: { uploader: { select: { name: true, image: true } }, recipient: { select: { name: true, image: true } } }
        })
     } else {
        // Admin and Owner see all documents
        documents = await prisma.document.findMany({
           orderBy: { createdAt: 'desc' },
           include: { uploader: { select: { name: true, image: true } }, recipient: { select: { name: true, image: true } } }
        })
     }

     return NextResponse.json(documents)
  } catch(error: unknown) {
     return NextResponse.json({ error: "Failed to fetch documents" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
     const session = await getServerSession(authOptions)
     if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

     const body = await request.json()
     const { type, name, url, expiresAt, recipientId, targetRole } = body

     const doc = await prisma.document.create({
         data: {
             type,
             title: name,
             url,
             expiresAt: expiresAt ? new Date(expiresAt) : null,
             uploaderId: session.user.id,
             recipientId: recipientId || null,
             targetRole: targetRole || null
         }
     })

     let notifyList = [];
     if (recipientId) {
         notifyList.push(recipientId);
     } else if (targetRole === 'ALL WORKERS') {
         const workers = await prisma.user.findMany({ where: { role: 'WORKER' } });
         notifyList = workers.map(w => w.id);
     } else if (targetRole === 'ALL SUBMANAGERS') {
         const submanagers = await prisma.user.findMany({ where: { role: 'SUB_MANAGER' } });
         notifyList = submanagers.map(s => s.id);
     } else if (targetRole === 'ALL') {
         const allUsers = await prisma.user.findMany({ where: { id: { not: session.user.id } } });
         notifyList = allUsers.map(u => u.id);
     } else {
         const admins = await prisma.user.findMany({ where: { role: { in: ["ADMIN", "OWNER"] } } })
         notifyList = admins.map(a => a.id);
     }

     if (notifyList.length > 0) {
         await prisma.notification.createMany({
             data: notifyList.map(id => ({
                 userId: id,
                 title: `New Document: ${type}`,
                 message: `${session.user.name || 'A user'} shared a ${type} document: ${name}`,
                 type: "INFO",
                 link: "/dashboard/documents"
             }))
         })
     }

     return NextResponse.json(doc)
  } catch(error: unknown) {
     return NextResponse.json({ error: "Failed to upload document" }, { status: 500 })
  }
}
