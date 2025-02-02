// /src/server/api/routers/auth.ts
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { z } from "zod";
import { hash } from "bcryptjs";
import { db } from "~/server/db";

export const authRouter = createTRPCRouter({
  signup: publicProcedure
    .input(
      z.object({
        name: z.string().min(1, "Name is required"), // Add name field
        email: z.string().email(),
        password: z.string().min(6),
      }),
    )
    .mutation(async ({ input }) => {
      const { name, email, password } = input;

      // Check if user already exists
      const existingUser = await db.user.findUnique({ where: { email } });

      if (existingUser) {
        throw new Error("User already exists");
      }

      // Hash the password
      const hashedPassword = await hash(password, 10);

      // Create the user
      const user = await db.user.create({
        data: {
          name, // Add name to the user creation
          email,
          hashedPassword,
        },
      });

      return { message: "User created successfully", user };
    }),
});