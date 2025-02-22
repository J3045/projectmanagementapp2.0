import { protectedProcedure, createTRPCRouter } from "../trpc";
import { z } from "zod";
import { TaskStatus, TaskPriority } from "@prisma/client";

// Define input schemas for reusability
const createTaskInput = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  projectId: z.number(),
  assignedUserIds: z.array(z.string()).default([]), // Ensure it's always an array
  dueDate: z.date().nullable(),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  tags: z.string().optional(),
  startDate: z.date().nullable(),
  points: z.number().optional(),
});

const updateTaskInput = z.object({
  id: z.number(),
  title: z.string().min(1, "Title is required").optional(),
  description: z.string().optional(),
  assignedUserIds: z.array(z.string()).default([]), // Ensure it's always an array
  dueDate: z.date().nullable(),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  tags: z.string().optional(),
  startDate: z.date().nullable(),
  points: z.number().optional(),
});

const updateTaskStatusInput = z.object({
  id: z.number(),
  newStatus: z.nativeEnum(TaskStatus),
});

const deleteTaskInput = z.object({
  id: z.number(),
});

export const taskRouter = createTRPCRouter({
  // Create a new task
  createTask: protectedProcedure
    .input(createTaskInput)
    .mutation(async ({ input, ctx }) => {
      try {
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
              connect: input.assignedUserIds.map((userId) => ({ id: userId })), // Connect multiple users
            },
          },
        });
        return newTask;
      } catch (error) {
        throw new Error("Failed to create task");
      }
    }),

  // Fetch all tasks for a specific project
  getTasksByProject: protectedProcedure
    .input(z.number()) // projectId
    .query(async ({ input, ctx }) => {
      try {
        return await ctx.db.task.findMany({
          where: {
            projectId: input,
          },
          include: {
            assignedUsers: true, // Include assigned users in the response
          },
        });
      } catch (error) {
        throw new Error("Failed to fetch tasks");
      }
    }),

  // Update an existing task
  updateTask: protectedProcedure
    .input(updateTaskInput)
    .mutation(async ({ input, ctx }) => {
      try {
        return await ctx.db.task.update({
          where: { id: input.id },
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
              set: input.assignedUserIds.map((userId) => ({ id: userId })), // Update assigned users
            },
          },
        });
      } catch (error) {
        throw new Error("Failed to update task");
      }
    }),

  // Update task status
  updateTaskStatus: protectedProcedure
    .input(updateTaskStatusInput)
    .mutation(async ({ input, ctx }) => {
      try {
        return await ctx.db.task.update({
          where: { id: input.id },
          data: {
            status: input.newStatus,
          },
        });
      } catch (error) {
        throw new Error("Failed to update task status");
      }
    }),

  // Delete a task
  deleteTask: protectedProcedure
    .input(deleteTaskInput)
    .mutation(async ({ input, ctx }) => {
      try {
        const existingTask = await ctx.db.task.findUnique({ where: { id: input.id } });
        if (!existingTask) {
          throw new Error("Task not found");
        }

        await ctx.db.task.delete({
          where: { id: input.id },
        });

        return { message: "Task deleted successfully" };
      } catch (error) {
        throw new Error("Failed to delete task");
      }
    }),
});