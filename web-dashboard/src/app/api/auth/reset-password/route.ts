import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
  try {
    const { phone, otp, newPassword } = await request.json()

    if (!phone || !otp || !newPassword) {
      return NextResponse.json({ error: "Phone number, OTP, and a new password are required." }, { status: 400 })
    }

    // Find the verification token in standard NextAuth format
    const resetToken = await prisma.verificationToken.findFirst({
        where: {
            identifier: phone,
            token: otp
        }
    })

    if (!resetToken) {
        return NextResponse.json({ error: "Invalid or expired OTP code." }, { status: 400 })
    }

    // Check if the token has expired
    if (new Date(resetToken.expires) < new Date()) {
        await prisma.verificationToken.deleteMany({
            where: { identifier: phone }
        })
        return NextResponse.json({ error: "This OTP code has expired. Please request a new one." }, { status: 400 })
    }

    // OTP is valid and hasn't expired. Update the user password.
    const user = await prisma.user.findUnique({
        where: { phone: phone }
    })

    if (!user) {
        return NextResponse.json({ error: "User account could not be found." }, { status: 404 })
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)

    await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword }
    })

    // Cleanup the used token
    await prisma.verificationToken.deleteMany({
        where: { identifier: phone }
    })

    return NextResponse.json({ 
        message: "Password has been reset successfully." 
    }, { status: 200 })

  } catch (error) {
    console.error("Reset Password Error:", error)
    return NextResponse.json({ error: "Failed to reset password. Please try again." }, { status: 500 })
  }
}
