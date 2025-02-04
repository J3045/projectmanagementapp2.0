import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import Layout from "~/components/Layout";
import { motion } from "framer-motion";

type TaskStatus = "TO_DO" | "IN_PROGRESS" | "IN_REVIEW" | "COMPLETED";

type Task = {
  id: number;
  title: string;
  status: TaskStatus;
  description?: string;
  assignedUsers: { id: string; name: string | null }[];
};

const statusMapping: Record<TaskStatus, string> = {
  TO_DO: "To Do",
  IN_PROGRESS: "In Progress",
  IN_REVIEW: "In Review",
  COMPLETED: "Completed",
};

const statuses: TaskStatus[] = ["TO_DO", "IN_PROGRESS", "IN_REVIEW", "COMPLETED"];

const ProjectPage = () => {
  const router = useRouter();
  const { id } = router.query;

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { data: project, isLoading: projectLoading, error: projectError } =
    api.project.getProjectById.useQuery({ id: parseInt(id as string) }, { enabled: !!id });

  const { data: fetchedTasks, isLoading: tasksLoading, error: tasksError } =
    api.task.getTasksByProject.useQuery(parseInt(id as string), { enabled: !!id });

  const updateTaskStatusMutation = api.task.updateTaskStatus.useMutation();

  useEffect(() => {
    if (fetchedTasks) {
      setTasks(
        fetchedTasks.map((task) => ({
          ...task,
          status: task.status ?? "TO_DO",
          description: task.description ?? undefined,
        }))
      );
    }
    if (projectError ?? tasksError) {
      setError("Error loading project or tasks");
    }
    setLoading(projectLoading ?? tasksLoading);
  }, [fetchedTasks, projectLoading, tasksLoading, projectError, tasksError]);

  if (loading) return <div className="text-center text-lg font-semibold">Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!project) return <div className="text-gray-600">Project not found</div>;

  // Group tasks by status
  const groupedTasks = tasks.reduce<Record<TaskStatus, Task[]>>(
    (acc, task) => {
      acc[task.status] = acc[task.status] ?? [];
      acc[task.status].push(task);
      return acc;
    },
    { TO_DO: [], IN_PROGRESS: [], IN_REVIEW: [], COMPLETED: [] }
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

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-bold mb-4 text-gray-800"
        >
          {project.name}
        </motion.h1>
        <p className="mb-6 text-gray-600">{project.description ?? "No description available"}</p>

        <div className="flex space-x-6 overflow-x-auto pb-4">
          {statuses.map((status) => (
            <motion.div
              key={status}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: statuses.indexOf(status) * 0.1 }}
              className="bg-gray-100 p-5 rounded-xl shadow-lg w-80 min-w-[260px]"
            >
              <h2 className="text-lg font-semibold text-gray-700 mb-3">
                {statusMapping[status]}
              </h2>
              <div className="space-y-3 max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400">
                {groupedTasks[status]?.length > 0 ? (
                  groupedTasks[status].map((task) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-all"
                    >
                      <h4 className="font-medium text-gray-800">{task.title}</h4>
                      <p className="text-sm text-gray-600">
                        {task.description ?? "No description available"}
                      </p>
                      <div className="text-xs text-gray-500 mt-2">
                        <strong>Assigned to:</strong>
                        <ul>
                          {task.assignedUsers.map((user) => (
                            <li key={user.id} className="text-gray-700">
                              {user.name ?? "Unknown"}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="mt-3">
                        <label className="text-sm font-medium">Change Status:</label>
                        <select
                          className="ml-2 p-1 border rounded bg-gray-50"
                          value={task.status}
                          onChange={(e) => handleStatusChange(task.id, e.target.value as TaskStatus)}
                        >
                          {statuses.map((s) => (
                            <option key={s} value={s}>
                              {statusMapping[s]}
                            </option>
                          ))}
                        </select>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-gray-500 text-sm"
                  >
                    No tasks in this status
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default ProjectPage;
