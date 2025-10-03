
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { DB } from "./prisma";
import { compare } from "bcrypt";
import { PrismaAdapter } from "@next-auth/prisma-adapter";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(DB),
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "jsmith@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const existingUser = await DB.user.findUnique({
          where: { email: credentials.email },
        });

        if (!existingUser) return null;

        const passwordMatch = await compare(credentials.password, existingUser.password);
        if (!passwordMatch) return null;

        // Use `name` so NextAuth callbacks and session can work properly
        return {
          id: `${existingUser.id}`,
          name: existingUser.firstName, 
          email: existingUser.email,
          role: existingUser.role,
        };
      },
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
          role: token.role,
          username: token.username, // map back firstName to session.user.username
        },
      };
    },
  },
};
