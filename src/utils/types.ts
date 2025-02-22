import { TaskStatus, TaskPriority } from "@prisma/client";

export type Task = {
  id?: number;
  title: string;
  description?: string | null;
  status: TaskStatus | null;
  priority: TaskPriority | null;
  tags?: string | null;
  startDate?: Date | null;
  dueDate?: Date | null;
  points?: number | null;
  assignedUsers: { id: string; name: string | null }[];
};