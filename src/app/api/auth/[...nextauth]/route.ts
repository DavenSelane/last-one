import { authOptions } from "@/lib/auth";
import NextAuth from "next-auth";
// 👈 correct path, not "@/public/lib/auth"

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
