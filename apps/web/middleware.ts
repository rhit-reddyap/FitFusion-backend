import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const user = req.nextauth?.token;

    // ✅ Only allow YOUR email to access /admin
    if (req.nextUrl.pathname.startsWith("/admin")) {
      if (user?.email !== "your-email@example.com") {
        return NextResponse.redirect(new URL("/signin", req.url));
      }
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token, // allow signed-in users by default
    },
  }
);

export const config = {
  matcher: ["/admin/:path*"], // protect all admin routes
};
