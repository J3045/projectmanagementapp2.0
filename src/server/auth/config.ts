import { PrismaAdapter } from "@auth/prisma-adapter"; 
import { type DefaultSession, type NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import DiscordProvider from "next-auth/providers/discord";
import { db } from "~/server/db";
import { compare } from "bcryptjs";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      email: string;
    } & DefaultSession["user"];
  }
}

export const authConfig = {
  adapter: PrismaAdapter(db),
  session: {
    strategy: "jwt", // Store sessions in the database
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
      async authorize(credentials) {
        const email = credentials?.email as string;
        const password = credentials?.password as string;

        if (!email || !password) {
          throw new Error("Email and Password are required");
        }

        const user = await db.user.findUnique({ where: { email } });

        if (!user?.hashedPassword) {
          throw new Error("Invalid email or password");
        }

        const isValidPassword = await compare(password, user.hashedPassword);

        if (!isValidPassword) {
          throw new Error("Invalid email or password");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      console.log("JWT callback:", { token, user });
      return token;
    }
    ,
    async session({ session, token }) {
      if (token && token.id && token.email) {
        session.user.id = token?.id as string;
        session.user.email = token?.email as string;

      }
      console.log("Session callback:", { session, token });
      return session;
    }
    
   
  },
  
  pages: {
    signIn: "/auth/signin",
  },
  secret: process.env.AUTH_SECRET,
} satisfies NextAuthConfig;