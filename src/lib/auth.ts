import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { DB } from "./prisma";
import {compare} from "bcrypt"
import { PrismaAdapter } from "@next-auth/prisma-adapter";

export const authOptions: NextAuthOptions = {
  // Remove adapter when using JWT strategy with credentials provider
  // adapter: PrismaAdapter(DB),
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/sign-in",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "jsmith@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
  console.log("Credentials received:", credentials);

  if (!credentials?.email || !credentials?.password) {
    console.log("Missing email or password");
    return null;
  }

  let existingUser = await DB.user.findUnique({
    where: { email: credentials.email.toLowerCase() },
  });

  if (!existingUser) {
    // Try with original case for backward compatibility
    existingUser = await DB.user.findUnique({
      where: { email: credentials.email },
    });
  }

  if (!existingUser) {
    console.log("No user found for email:", credentials.email);
    return null;
  }

  const passwordMatch = await compare(credentials.password, existingUser.password);
  if (!passwordMatch) {
    console.log("Password mismatch for:", credentials.email);
    return null;
  }

  console.log("Login success for:", existingUser.role);
  return {
    id: `${existingUser.id}`,
    name: existingUser.firstName,
    email: existingUser.email,
    role: existingUser.role,
  };
}
,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      
      if (user) {
        return {
          ...token,
          
            role: (user as any).role, 
          username: user.name, // store firstName as username
        };
      }
      return token;
    },
    async session({ session, token }) {
      console.log("Session callback:", { session, token });
      return {
        ...session,
        user: {
          ...session.user,
          id: token.sub,
          role: token.role,
          username: token.username, // map back firstName to session.user.username
        },
      };
    },
  },
};
