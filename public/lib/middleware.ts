import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import { routeAccessMap } from "./settings"; // ✅ make sure this path is correct

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ✅ 1. Get the JWT token from NextAuth
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // ✅ 2. Block users if not logged in
  if (!token) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  const role = String(token.role || "").toLowerCase();

  // ✅ 3. Loop through the route access rules
  for (const route in routeAccessMap) {
    const allowedRoles = routeAccessMap[route];
    const regex = new RegExp(`^${route.replace("(.*)", ".*")}$`);

    if (regex.test(pathname)) {
      if (!allowedRoles.includes(role)) {
        return NextResponse.redirect(new URL(`/${role}`, req.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next|.*\\.(?:html?|css|js|json|png|jpg|jpeg|gif|svg|ico|woff2?)$).*)',
    '/(api|trpc)(.*)',
  ],
};
