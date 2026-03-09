import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
     const session = await getServerSession(authOptions)
     if (!session?.user || !["OWNER", "ADMIN"].includes(session.user.role)) {
       return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
     }

     const resolvedParams = await params;
     const id = resolvedParams.id;

     const body = await request.json()
     const { baseSalary, overtime, bonuses, allowances, deductions, penalties, status } = body

     // Calculate total automatically
     const base = parseFloat(baseSalary) || 0
     const ovr = parseFloat(overtime) || 0
     const bon = parseFloat(bonuses) || 0
     const allw = parseFloat(allowances) || 0
     const ded = parseFloat(deductions) || 0
     const pen = parseFloat(penalties) || 0
     
     const totalAmount = base + ovr + bon + allw - ded - pen

     const updatedPayroll = await prisma.payroll.update({
        where: { id },
        data: {
           baseSalary: base,
           overtime: ovr,
           bonuses: bon,
           allowances: allw,
           deductions: ded,
           penalties: pen,
           totalAmount,
           status
        }
     })

     return NextResponse.json(updatedPayroll)
  } catch (error) {
     return NextResponse.json({ error: "Failed to update payroll" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
     const session = await getServerSession(authOptions)
     if (!session?.user || !["OWNER", "ADMIN"].includes(session.user.role)) {
       return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
     }

     const resolvedParams = await params;
     const id = resolvedParams.id;

     await prisma.payroll.delete({
        where: { id }
     })

     return NextResponse.json({ success: true })
  } catch (error) {
     return NextResponse.json({ error: "Failed to delete payroll" }, { status: 500 })
  }
}
