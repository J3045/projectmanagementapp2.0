import { protectedProcedure, createTRPCRouter } from "../trpc";
import { z } from "zod";
import { TaskStatus, TaskPriority } from "@prisma/client"; // Import enums

export const taskRouter = createTRPCRouter({
  // Create a new task
  createTask: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        description: z.string().optional(),
        projectId: z.number(),
        assignedUserIds: z.array(z.string()).optional(), // Array of user IDs
        dueDate: z.date().nullable(),
        status: z.nativeEnum(TaskStatus).optional(), // Use enum type
        priority: z.nativeEnum(TaskPriority).optional(), // Use enum type
        tags: z.string().optional(),
        startDate: z.date().nullable(),
        points: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const newTask = await ctx.db.task.create({
        data: {
          title: input.title,
          description: input.description,
          projectId: input.projectId,
          status: input.status,
          priority: input.priority,
          tags: input.tags,
          startDate: input.startDate,
          dueDate: input.dueDate,
          points: input.points,
          authorUserId: ctx.session.user.id,
          assignedUsers: {
            connect: input.assignedUserIds?.map((userId) => ({ id: userId })), // Connect multiple users
          },
        },
      });
      return newTask;
    }),

  // Fetch all tasks for a specific project
  getTasksByProject: protectedProcedure
    .input(z.number()) // projectId
    .query(async ({ input, ctx }) => {
      return await ctx.db.task.findMany({
        where: {
          projectId: input,
        },
        include: {
          assignedUsers: true, // Include assigned users in the response
        },
      });
    }),

  // Update an existing task
  updateTask: protectedProcedure
    .input(
      z.object({
        id: z.number(), // Update the field name to `id` instead of `taskId`
        title: z.string().optional(),
        description: z.string().optional(),
        assignedUserIds: z.array(z.string()).optional(), // Array of user IDs
        dueDate: z.date().nullable(),
        status: z.nativeEnum(TaskStatus).optional(), // Use enum type
        priority: z.nativeEnum(TaskPriority).optional(), // Use enum type
        tags: z.string().optional(),
        startDate: z.date().nullable(),
        points: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await ctx.db.task.update({
        where: { id: input.id }, // Use `id` as the identifier
        data: {
          title: input.title,
          description: input.description,
          status: input.status,
          priority: input.priority,
          tags: input.tags,
          startDate: input.startDate,
          dueDate: input.dueDate,
          points: input.points,
          assignedUsers: {
            set: input.assignedUserIds?.map((userId) => ({ id: userId })), // Update assigned users
          },
        },
      });
    }),

  // Update task status
  updateTaskStatus: protectedProcedure
    .input(
      z.object({
        id: z.number(), // Use `id` for the task
        newStatus: z.nativeEnum(TaskStatus), // Ensure the status is valid according to the enum
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await ctx.db.task.update({
        where: { id: input.id }, // Use `id` for the task
        data: {
          status: input.newStatus, // Update the status in the database
        },
      });
    }),
});
