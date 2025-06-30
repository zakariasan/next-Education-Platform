import { prisma } from "@/lib/prisma";
import { getServerSession, NextAuthOptions } from "next-auth";
import bcrypt from "bcrypt";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      // The name to display on the sign in form (e.g. "Sign in with...")
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        // Add logic here to look up the user from the credentials supplied

        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) return null;

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password,
        );
        if (!isValid) return null;
        return { id: user.id, name: user.name, email: user.email, avatar: "https://github.com/shadcn.png" };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        // For OAuth providers (Google, Facebook)
        if (
          account?.provider === "google" ||
          account?.provider === "facebook"
        ) {
          if (!user.email) return false;

          // Check if user already exists
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
          });

          // If user doesn't exist, create them
          if (!existingUser) {
            const hashedPass = await bcrypt.hash(user.email + "25", 10);
            await prisma.user.create({
              data: {
                email: user.email,
                name: user.name || "",
                avatar: user.image || "https://github.com/shadcn.png", // Use OAuth provider's image
                provider: account.provider, // "google" or "facebook"
                password: hashedPass, // OAuth users don't need passwords
                role: null, // Will redirect to role selection
              },
            });
          } else {
            // Update existing user with OAuth info if needed
            await prisma.user.update({
              where: { email: user.email },
              data: {
                provider: account.provider,
                avatar: user.image || existingUser.avatar,
                name: user.name || existingUser.name,
              },
            });
          }
        }
        return true;
      } catch (error) {
        console.error("Error in signIn callback:", error);
        return false;
      }
    },
    async jwt({ token, user, account }) {
      // If signing in, get user data from database
      if (user) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email! },
        });

        if (dbUser && user) {
          token.id = dbUser.id;
          token.role = dbUser.role;
          token.provider = dbUser.provider;
          token.avatar = dbUser.avatar;
        }
      }
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string | null;
        session.user.provider = token.provider as string | null;
        session.user.avatar = token.avatar as string | "https://github.com/shadcn.png";
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
    newUser: "/auth/select-role",
  },
};
