"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Layout from "../components/Layout";
import AddProjectForm from "~/components/AddProjectForm";
import AddTaskModal from "~/components/AddTaskModal";
import { api } from "~/utils/api";
import { type Task, TaskStatus } from "@prisma/client";
import { FaTrash, FaEdit, FaPlus, FaCalendarAlt, FaChevronDown, FaChevronUp, FaFilter } from "react-icons/fa";

const Dashboard = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    projectId: number;
    projectName: string;
  } | null>(null);
  const [loadingProjectId, setLoadingProjectId] = useState<number | null>(null);
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [editProjectData, setEditProjectData] = useState<{
    id: number;
    name: string;
    description: string;
    startDate: string;
    endDate: string;
  } | null>(null);
  const [expandedDescriptions, setExpandedDescriptions] = useState<Record<number, boolean>>({});
  const [showFilters, setShowFilters] = useState(false);
  const [filterCriteria, setFilterCriteria] = useState<{
    taskCount?: "asc" | "desc";
    status?: "No Tasks" | "In Progress" | "Completed";
    dueDate?: "asc" | "desc";
  }>({});

  const filterRef = useRef<HTMLDivElement>(null);

  const { data: projects, isError, refetch } = api.project.getAllProjects.useQuery();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setShowFilters(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const deleteProject = api.project.deleteProject.useMutation({
    onMutate: ({ id }) => setLoadingProjectId(id),
    onSuccess: () => {
      setDeleteConfirmation(null);
      refetch();
    },
    onSettled: () => setLoadingProjectId(null),
  });

  const updateProject = api.project.updateProject.useMutation({
    onSuccess: () => {
      refetch();
      setIsEditingProject(false);
      setEditProjectData(null);
    },
  });

  const getProjectStatus = useCallback((tasks: Task[]) => {
    if (tasks.length === 0) return "No Tasks";
    return tasks.every((task) => task.status === TaskStatus.COMPLETED) ? "Completed" : "In Progress";
  }, []);

  const handleDeleteConfirmation = useCallback((projectId: number, projectName: string) => {
    setDeleteConfirmation({ projectId, projectName });
  }, []);

  const handleDeleteProject = useCallback(() => {
    if (deleteConfirmation) {
      deleteProject.mutate({ id: deleteConfirmation.projectId });
    }
  }, [deleteConfirmation, deleteProject]);

  const handleEditProject = useCallback((project: {
    id: number;
    name: string;
    description: string;
    startDate: string;
    endDate: string;
  }) => {
    setEditProjectData(project);
    setIsEditingProject(true);
  }, []);

  const handleUpdateProject = useCallback((updatedData: {
    id: number;
    name: string;
    description: string;
    startDate: string;
    endDate: string;
  }) => {
    updateProject.mutate(updatedData);
  }, [updateProject]);

  const toggleDescription = useCallback((projectId: number) => {
    setExpandedDescriptions((prev) => ({
      ...prev,
      [projectId]: !prev[projectId],
    }));
  }, []);

  const filteredProjects = projects?.filter((project) => {
    const status = getProjectStatus(project.tasks);
    if (filterCriteria.status && status !== filterCriteria.status) {
      return false;
    }
    return true;
  });

  const sortedProjects = filteredProjects?.sort((a, b) => {
    if (filterCriteria.taskCount) {
      const taskCountA = a.tasks.length;
      const taskCountB = b.tasks.length;
      if (filterCriteria.taskCount === "asc") {
        return taskCountA - taskCountB;
      } else {
        return taskCountB - taskCountA;
      }
    }

    if (filterCriteria.dueDate) {
      const dateA = a.endDate ? new Date(a.endDate).getTime() : Infinity;
      const dateB = b.endDate ? new Date(b.endDate).getTime() : Infinity;
      if (filterCriteria.dueDate === "asc") {
        return dateA - dateB;
      } else {
        return dateB - dateA;
      }
    }

    return 0;
  });

  if (isError) {
    return (
      <div className="text-center text-red-500 font-semibold">
        Error fetching projects. Please try again later.
      </div>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-12 px-4">
        <motion.div
          className="flex justify-between items-center mb-12 p-8 rounded-xl bg-gradient-to-r from-gray-700 via-gray-800 to-gray-900 shadow-lg text-white"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <h1 className="text-4xl font-bold">
              Welcome back, <span className="text-indigo-400">{session?.user?.name || "User"}</span>!
            </h1>
            <p className="mt-2 text-lg text-gray-300">Track your projects and tasks effortlessly</p>
          </div>
        </motion.div>

        <motion.div
          className="mb-8 flex justify-between items-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-500 transition transform hover:scale-105 focus:ring-4 focus:ring-indigo-300"
          >
            {isAddingProject ? "Adding..." : "+ Create New Project"}
          </button>

          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg shadow-md hover:bg-gray-500 transition transform hover:scale-105 flex items-center gap-2"
            >
              <FaFilter /> Filter
            </button>

            {showFilters && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg p-4 z-10">
                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2">Task Count</label>
                  <select
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    onChange={(e) =>
                      setFilterCriteria((prev) => ({
                        ...prev,
                        taskCount: e.target.value as "asc" | "desc",
                      }))
                    }
                  >
                    <option value="">Select Order</option>
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2">Status</label>
                  <select
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    onChange={(e) =>
                      setFilterCriteria((prev) => ({
                        ...prev,
                        status: e.target.value as "No Tasks" | "In Progress" | "Completed",
                      }))
                    }
                  >
                    <option value="">Select Status</option>
                    <option value="No Tasks">No Tasks</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Due Date</label>
                  <select
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    onChange={(e) =>
                      setFilterCriteria((prev) => ({
                        ...prev,
                        dueDate: e.target.value as "asc" | "desc",
                      }))
                    }
                  >
                    <option value="">Select Order</option>
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {showModal && (
          <AddProjectForm
            onClose={() => setShowModal(false)}
            refetch={refetch}
            setIsAddingProject={setIsAddingProject}
          />
        )}

        {isEditingProject && editProjectData && (
          <AddProjectForm
            onClose={() => {
              setIsEditingProject(false);
              setEditProjectData(null);
            }}
            refetch={refetch}
            setIsAddingProject={setIsAddingProject}
            projectData={editProjectData}
            onUpdate={handleUpdateProject}
          />
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {sortedProjects?.map((project, index) => (
            <motion.div
              key={project.id}
              className="bg-white shadow-lg rounded-xl p-6 hover:shadow-2xl transition duration-300 border border-gray-100 flex flex-col justify-between"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <div onClick={() => router.push(`/projects/${project.id}`)} className="cursor-pointer">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">{project.name}</h3>
                <div className="text-gray-600 text-sm">
                  <p className={expandedDescriptions[project.id] ? "" : "line-clamp-2"}>
                    {project.description || "No description available"}
                  </p>
                  {project.description && project.description.length > 100 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleDescription(project.id);
                      }}
                      className="text-indigo-600 hover:text-indigo-500 mt-1 flex items-center text-sm"
                    >
                      {expandedDescriptions[project.id] ? (
                        <>
                          <FaChevronUp className="mr-1" /> Show Less
                        </>
                      ) : (
                        <>
                          <FaChevronDown className="mr-1" /> Show More
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-4 flex items-center text-gray-700 text-sm">
                <FaCalendarAlt className="mr-2 text-gray-500" />
                <span>
                  {project.startDate?.toISOString().split("T")[0]} -{" "}
                  {project.endDate?.toISOString().split("T")[0]}
                </span>
              </div>

              <div className="mt-4 flex justify-between items-center">
                <div className="text-gray-700 text-sm">
                  <span className="font-semibold">Tasks:</span> {project.tasks.length}
                </div>
                <p
                  className={`text-sm font-semibold ${
                    getProjectStatus(project.tasks) === "Completed"
                      ? "text-green-500"
                      : "text-yellow-500"
                  }`}
                >
                  {getProjectStatus(project.tasks)}
                </p>
              </div>

              <div className="flex gap-4 mt-4 border-t border-gray-100 pt-4">
                <FaPlus
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedProject(project.id);
                    setShowTaskModal(true);
                  }}
                  className="text-indigo-600 cursor-pointer hover:text-indigo-500 transition text-xl"
                />

                <FaEdit
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditProject({
                      id: project.id,
                      name: project.name,
                      description: project.description || "",
                      startDate: project.startDate?.toISOString().split("T")[0] || "",
                      endDate: project.endDate?.toISOString().split("T")[0] || "",
                    });
                  }}
                  className="text-yellow-500 cursor-pointer hover:text-yellow-400 transition text-xl"
                />

                <FaTrash
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteConfirmation(project.id, project.name);
                  }}
                  className="text-red-600 cursor-pointer hover:text-red-500 transition text-xl"
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {showTaskModal && selectedProject && (
        <AddTaskModal
          projectId={selectedProject}
          onClose={() => setShowTaskModal(false)}
          refetchTasks={refetch}
        />
      )}

      {deleteConfirmation && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-semibold mb-4">
              Are you sure you want to delete "{deleteConfirmation.projectName}"?
            </h2>
            <div className="flex justify-end gap-4">
              <button
                className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400 transition"
                onClick={() => setDeleteConfirmation(null)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
                onClick={handleDeleteProject}
              >
                {loadingProjectId === deleteConfirmation.projectId ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Dashboard;