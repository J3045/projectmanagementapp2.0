import { PrismaAdapter } from "@auth/prisma-adapter";
import { type DefaultSession, type NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import DiscordProvider from "next-auth/providers/discord";
import { db } from "~/server/db";
import { compare } from "bcryptjs";
import pino from "pino";
import rateLimit from "express-rate-limit";

// ✅ Logger for better debugging
const logger = pino();
export interface Session extends DefaultSession {
  user: {
    id: string;
  } & DefaultSession["user"];
  expire: string;
}
// ✅ Rate limiter to prevent brute force attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Max 5 login attempts per 15 minutes
  message: "Too many login attempts, please try again later.",
});

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
    } & DefaultSession["user"];
    expire: string;
  }
}

export const authConfig = {
  adapter: PrismaAdapter(db),
  session: {
    strategy: "jwt",
  },
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "your@example.com" },
        password: { label: "Password", type: "password", placeholder: "******" },
      },
      async authorize(credentials, req) {
        limiter(req, {}, () => {}); // Apply rate limiting

        const email = credentials?.email as string;
        const password = credentials?.password as string;

        if (!email || !password) {
          logger.warn("Missing credentials");
          throw new Error("Invalid credentials");
        }

        const user = await db.user.findUnique({
          where: { email },
          select: { id: true, email: true, name: true, hashedPassword: true },
        });

        if (!user?.hashedPassword) {
          logger.warn(`Login failed for email: ${email}`);
          throw new Error("Invalid credentials");
        }

        const isValidPassword = await compare(password, user.hashedPassword);

        if (!isValidPassword) {
          logger.warn(`Invalid password attempt for email: ${email}`);
          throw new Error("Invalid credentials");
        }

        logger.info(`User ${email} logged in successfully`);

        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
        token.exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7; // 7 Days Expiry
      }
      return token;
    },

    async session({ session, token }) {
      const userId = token.id as string;

      if (!userId) return session;

      const freshUser = await db.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          emailVerified: true,
        },
      });

      if (freshUser) {
        session.user = {
          ...freshUser,
          email: freshUser.email ?? "",
        };
      }

      return session;
    },
  },

  pages: {
    signIn: "/auth/signin",
  },

  secret: process.env.AUTH_SECRET,
} satisfies NextAuthConfig;
