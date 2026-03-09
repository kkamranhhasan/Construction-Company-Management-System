import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
     const session = await getServerSession(authOptions)
     if (!session?.user) {
       return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
     }

     const userId = session.user.id;
     const role = session.user.role;
     
     let allowedContacts: any[] = [];

     if (role === 'WORKER') {
        // Workers can only contact their assigned SubManagers
        const workerProfile = await prisma.workerProfile.findUnique({
            where: { userId },
            include: {
                assignedSites: {
                    include: {
                        site: {
                            include: { subManager: true }
                        }
                    }
                }
            }
        });
        
        let subManagers = workerProfile?.assignedSites
            .map(ws => ws.site.subManager)
            .filter(Boolean) || [];
            
        // Deduplicate contacts
        allowedContacts = Array.from(new Map(subManagers.map(item => [item?.id, item])).values());
     } 
     else if (role === 'SUB_MANAGER') {
        // SubManagers can contact Workers on their sites, Admins, and Owners
        const sites = await prisma.site.findMany({
            where: { subManagerId: userId },
            include: {
                workers: {
                    include: {
                        worker: {
                            include: { user: true }
                        }
                    }
                }
            }
        });
        
        const workers = sites.flatMap(s => s.workers.map(w => w.worker.user));
        const superiors = await prisma.user.findMany({
            where: { role: { in: ['ADMIN', 'OWNER'] } }
        });
        
        allowedContacts = [...workers, ...superiors];
     }
     else if (role === 'ADMIN' || role === 'OWNER') {
        // Admins and Owners can contact each other and SubManagers
        allowedContacts = await prisma.user.findMany({
            where: {
                OR: [
                    { role: 'SUB_MANAGER' },
                    { role: 'ADMIN' },
                    { role: 'OWNER' }
                ],
                NOT: { id: userId }
            }
        });
     }

     // ensure safe fields only
     const safeContacts = allowedContacts.map(c => ({
         id: c.id,
         name: c.name,
         email: c.email,
         role: c.role,
         image: c.image
     }));

     return NextResponse.json(safeContacts)
  } catch(error: unknown) {
     console.error("Contacts error:", error);
     return NextResponse.json({ error: "Failed to fetch contacts" }, { status: 500 })
  }
}
