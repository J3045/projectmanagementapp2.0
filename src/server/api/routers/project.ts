import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";
import { db } from "~/server/db";

export const projectRouter = createTRPCRouter({
  // Get all projects with associated tasks and teams
  getAllProjects: protectedProcedure.query(async () => {
    return await db.project.findMany({
      include: { tasks: true, },
    });
  }),

  // Get a specific project by ID, including tasks and teams
  getProjectById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await db.project.findUnique({
        where: { id: input.id },
        include: { tasks: true,  },
      });
    }),

  // Create a new project
  createProject: protectedProcedure
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

  // Update an existing project
  updateProject: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        startDate: z.string().optional(), // Accepts string, converts to Date
        endDate: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await db.project.update({
        where: { id: input.id },
        data: {
          name: input.name,
          description: input.description,
          startDate: input.startDate ? new Date(input.startDate) : undefined,
          endDate: input.endDate ? new Date(input.endDate) : undefined,
        },
      });
    }),


  // Delete a project
  deleteProject: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return await db.project.delete({
        where: { id: input.id },
      });
    }),
});