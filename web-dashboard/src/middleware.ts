import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const isAuth = !!req.nextauth.token
    const isAuthPage = req.nextUrl.pathname.startsWith("/login") || req.nextUrl.pathname.startsWith("/register")
    const isHomePage = req.nextUrl.pathname === "/"

    if (isAuthPage) {
      if (isAuth) {
        return NextResponse.redirect(new URL("/dashboard", req.url))
      }
      return null
    }

    if (isHomePage) {
      if (isAuth) {
        return NextResponse.redirect(new URL("/dashboard", req.url))
      }
    }

    return null
  },
  {
    callbacks: {
      authorized: () => true, // Let the middleware handle the redirect logic based on token presence
    },
  }
)

export const config = {
  matcher: ["/", "/login", "/register"],
}
