import { protectedProcedure, createTRPCRouter } from "../trpc";
import { z } from "zod";

export const teamRouter = createTRPCRouter({
  // Create a new team
  createTeam: protectedProcedure
    .input(
      z.object({
        teamName: z.string(),
        productOwnerUserId: z.string().nullable(),
        projectManagerUserId: z.string().nullable(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const newTeam = await ctx.db.team.create({
        data: {
          teamName: input.teamName,
          productOwnerUserId: input.productOwnerUserId,
          projectManagerUserId: input.projectManagerUserId,
        },
      });
      return newTeam;
    }),

  // Get all teams
  getTeams: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.team.findMany();
  }),

  // Add users to a team
  addUsersToTeam: protectedProcedure
    .input(
      z.object({
        teamId: z.number(),
        userIds: z.array(z.string()), // Array of user IDs to add
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await ctx.db.team.update({
        where: { id: input.teamId },
        data: {
          users: {
            connect: input.userIds.map((id) => ({ id })),
          },
        },
      });
    }),

  // Fetch the users of a specific team
  getUsersByTeam: protectedProcedure
    .input(z.number()) // teamId
    .query(async ({ input, ctx }) => {
      return await ctx.db.team.findUnique({
        where: { id: input },
        include: {
          users: true, // Includes all users associated with the team
        },
      });
    }),
});
