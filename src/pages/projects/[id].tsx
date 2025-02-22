import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { api } from "~/utils/api";
import Layout from "~/components/Layout";
import { motion, AnimatePresence } from "framer-motion";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import dynamic from "next/dynamic";
import { TaskStatus, TaskPriority } from "@prisma/client";
import { GetServerSideProps } from "next";
import { db } from "~/server/db";

const AddTaskModal = dynamic(() => import("~/components/AddTaskModal"), { ssr: false });

type Task = {
  id: number;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  tags?: string;
  startDate?: string | null; // Updated to string
  dueDate?: string | null; // Updated to string
  points?: number;
  assignedUsers: { 
    id: string; 
    name: string | null; 
  }[];
};

type ProjectPageProps = {
  project: {
    id: number;
    name: string;
    description: string | null;
  };
  tasks: Task[];
};

const statusMapping: Record<TaskStatus, string> = {
  TO_DO: "To Do",
  IN_PROGRESS: "In Progress",
  IN_REVIEW: "In Review",
  COMPLETED: "Completed",
};

const priorityMapping: Record<TaskPriority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
};

const statuses: TaskStatus[] = ["TO_DO", "IN_PROGRESS", "IN_REVIEW", "COMPLETED"];

export const getServerSideProps: GetServerSideProps<ProjectPageProps> = async (context) => {
  const { id } = context.params as { id: string };

  const project = await db.project.findUnique({
    where: { id: Number(id) },
    include: {
      tasks: {
        include: {
          assignedUsers: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  if (!project) {
    return {
      notFound: true,
    };
  }

  // Convert Date objects to strings
  const tasks = project.tasks.map((task) => ({
    id: task.id,
    title: task.title,
    description: task.description ?? undefined,
    status: task.status ?? 'TO_DO',
    priority: task.priority ?? 'LOW',
    tags: task.tags ?? undefined,
    startDate: task.startDate?.toISOString() ?? null, // Convert Date to string
    dueDate: task.dueDate?.toISOString() ?? null, // Convert Date to string
    points: task.points ?? undefined,
    assignedUsers: task.assignedUsers.map(({ id, name }) => ({
      id,
      name,
    })),
  }));

  return {
    props: {
      project: {
        id: project.id,
        name: project.name,
        description: project.description,
        tasks, // Include tasks in the project
      },
      tasks,
    },
  };
};

const ProjectPage = ({ project: initialProject, tasks: initialTasks }: ProjectPageProps) => {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const projectId = id ? Number(id) : null;
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [error, setError] = useState<string | null>(null);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const projectQuery = api.project.getProjectById.useQuery(
    { id: projectId ?? 0 },
    { enabled: !!projectId, initialData: initialProject }
  );

  const tasksQuery = api.task.getTasksByProject.useQuery(projectId ?? 0, {
    enabled: !!projectId,
    initialData: initialTasks,
  });

  if (!projectQuery.data) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-screen">
          <div className="text-gray-600">Project not found</div>
        </div>
      </Layout>
    );
  }

  const project = projectQuery.data;

  const updateTaskStatusMutation = api.task.updateTaskStatus.useMutation();
  const deleteTaskMutation = api.task.deleteTask.useMutation();

  useEffect(() => {
    if (tasksQuery.data) {
      setTasks(tasksQuery.data);
    }
    if (projectQuery.error || tasksQuery.error) {
      setError("Error loading project or tasks");
    }
  }, [tasksQuery.data, projectQuery.error, tasksQuery.error]);

  const groupedTasks = useMemo(
    () =>
      tasks.reduce<Record<TaskStatus, Task[]>>(
        (acc, task) => {
          acc[task.status] = acc[task.status] ?? [];
          acc[task.status].push(task);
          return acc;
        },
        { TO_DO: [], IN_PROGRESS: [], IN_REVIEW: [], COMPLETED: [] }
      ),
    [tasks]
  );

  const handleStatusChange = async (taskId: number, newStatus: TaskStatus) => {
    try {
      setTasks((prevTasks) =>
        prevTasks.map((task) => (task.id === taskId ? { ...task, status: newStatus } : task))
      );
      await updateTaskStatusMutation.mutateAsync({ id: taskId, newStatus });
    } catch (error) {
      console.error("Error updating task status:", error);
      setError("Failed to update task status.");
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    try {
      await deleteTaskMutation.mutateAsync({ id: taskId });
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
    } catch (error) {
      console.error("Error deleting task:", error);
      setError("Failed to delete task.");
    }
  };

  const handleAddTask = () => {
    setShowAddTaskModal(true);
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask({
      ...task,
      startDate: task.startDate ? new Date(task.startDate) : null,
      dueDate: task.dueDate ? new Date(task.dueDate) : null,
    });
    setShowAddTaskModal(true);
  };

  if (error) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-screen">
          <div className="text-red-500">{error}</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            {project.name}
          </h1>
          <p className="text-gray-600">
            {project.description ?? "No description available"}
          </p>
        </motion.div>

        <div className="flex justify-end mb-6">
          <button
            onClick={handleAddTask}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          >
            <FaPlus className="inline-block mr-2" />
            Add Task
          </button>
        </div>

        <div className="flex space-x-6 overflow-x-auto pb-4">
          {statuses.map((status) => (
            <motion.div
              key={status}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: statuses.indexOf(status) * 0.1 }}
              className="bg-gray-50 p-5 rounded-xl shadow-sm w-80 min-w-[260px] border border-gray-200"
            >
              <h2 className="text-lg font-semibold text-gray-700 mb-4">
                {statusMapping[status]}
              </h2>
              <div className="space-y-3 max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                <AnimatePresence>
                  {groupedTasks[status]?.length > 0 ? (
                    groupedTasks[status].map((task) => (
                      <motion.div
                        key={task.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-all"
                      >
                        <h4 className="font-medium text-gray-800 mb-2">{task.title}</h4>
                        <p className="text-sm text-gray-600 mb-3">
                          {task.description ?? "No description available"}
                        </p>
                        <div className="text-xs text-gray-500 mb-3">
                          <strong>Assigned to:</strong>
                          <ul className="mt-1">
                            {task.assignedUsers.map((user) => (
                              <li key={user.id} className="text-gray-700">
                                {user.name ?? "Unknown"}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="text-xs text-gray-500 mb-3">
                          <strong>Priority:</strong> {priorityMapping[task.priority]}
                        </div>
                        <div className="text-xs text-gray-500 mb-3">
                          <strong>Tags:</strong> {task.tags ?? "No tags"}
                        </div>
                        <div className="text-xs text-gray-500 mb-3">
                          <strong>Start Date:</strong>{" "}
                          {task.startDate ? new Date(task.startDate).toLocaleDateString() : "Not set"}
                        </div>
                        <div className="text-xs text-gray-500 mb-3">
                          <strong>Due Date:</strong>{" "}
                          {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "Not set"}
                        </div>
                        <div className="text-xs text-gray-500 mb-3">
                          <strong>Points:</strong> {task.points ?? "Not set"}
                        </div>
                        <div className="mt-3 flex justify-between items-center">
                          <select
                            className="p-1 border rounded bg-gray-50"
                            value={task.status}
                            onChange={(e) =>
                              handleStatusChange(task.id, e.target.value as TaskStatus)
                            }
                          >
                            {statuses.map((s) => (
                              <option key={s} value={s}>
                                {statusMapping[s]}
                              </option>
                            ))}
                          </select>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditTask(task)}
                              className="text-blue-500 hover:text-blue-700"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleDeleteTask(task.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-gray-500 text-sm"
                    >
                      No tasks in this status
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {showAddTaskModal && (
        <AddTaskModal
          projectId={Number(id)}
          onClose={() => {
            setShowAddTaskModal(false);
            setSelectedTask(null);
            tasksQuery.refetch();
          }}
          refetchTasks={tasksQuery.refetch}
          taskData={selectedTask}
        />
      )}
    </Layout>
  );
};

export default ProjectPage;