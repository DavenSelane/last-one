import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(req: any) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // Define role-based access rules
    const roleAccess: Record<string, string[]> = {
      '/admin': ['ADMIN'],
      '/tutor': ['TUTOR', 'ADMIN'],
      '/student': ['STUDENT', 'ADMIN'],
      '/parent': ['PARENT', 'ADMIN'],
      '/dashboard': ['ADMIN', 'TUTOR', 'STUDENT', 'PARENT'],
    };

    // Check if the current path requires specific roles
    for (const [path, allowedRoles] of Object.entries(roleAccess)) {
      if (pathname.startsWith(path)) {
        const userRole = token?.role as string;
        if (!userRole || !allowedRoles.includes(userRole)) {
          // Redirect to home page if user doesn't have access
          return Response.redirect(new URL('/', req.url));
        }
        break;
      }
    }

    // Additional logic can be added here if needed
  },
  {
    callbacks: {
      authorized: ({ token }: { token?: any }) => !!token,
    },
    pages: {
      signIn: "/sign-in",
    },
  }
);

export const config = {
  matcher: ["/(dashboard)/:path*", "/admin/:path*", "/tutor/:path*", "/student/:path*", "/parent/:path*"],
};
