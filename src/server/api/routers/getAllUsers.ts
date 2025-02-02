// /src/server/api/routers/user.ts
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";

export const userRouter = createTRPCRouter({
  getAllUsers: protectedProcedure.query(async () => {
    try {
      const users = await db.user.findMany({
        select: {
          id: true,
          name: true,
        },
      });
      return users;
    } catch (error) {
      console.error("Error fetching users:", error);
      throw new Error("Failed to fetch users");
    }
  }),
});