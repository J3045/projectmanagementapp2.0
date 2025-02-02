import { createTRPCRouter, publicProcedure } from "../trpc";
import { z } from "zod";
import { db } from "~/server/db";

export const projectRouter = createTRPCRouter({
  // Get all projects with associated tasks and teams
  getAllProjects: publicProcedure.query(async () => {
    return await db.project.findMany({
      include: { tasks: true, teams: true },
    });
  }),

  // Get a specific project by ID, including tasks and teams
  getProjectById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await db.project.findUnique({
        where: { id: input.id },
        include: { tasks: true, teams: true },
      });
    }),

  // Create a new project
  createProject: publicProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string().optional(),
        startDate: z.string().optional(), // Accepts string, converts to Date
        endDate: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await db.project.create({
        data: {
          name: input.name,
          description: input.description,
          startDate: input.startDate ? new Date(input.startDate) : null,
          endDate: input.endDate ? new Date(input.endDate) : null,
        },
      });
    }),

  // Assign a team to a project
  assignTeamToProject: publicProcedure
    .input(z.object({ projectId: z.number(), teamId: z.number() }))
    .mutation(async ({ input }) => {
      return await db.projectTeam.create({
        data: {
          projectId: input.projectId,
          teamId: input.teamId,
        },
      });
    }),
});
