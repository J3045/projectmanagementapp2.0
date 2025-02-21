import { useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import Layout from "../components/Layout";
import AddProjectForm from "~/components/AddProjectForm";
import AddTaskModal from "~/components/AddTaskModal";
import { api } from "~/utils/api";
import { Header } from "~/components/Header";
import { Filter } from "../components/Filter";
import { ProjectCard } from "../components/ProjectCard";
import { DeleteConfirmationModal } from "../components/DeleteConfirmationModal";
import { TaskStatus } from "@prisma/client";

export const Dashboard = () => {
  const { data: session } = useSession();
  const [loadingProjectId, setLoadingProjectId] = useState<number | null>(null); // Reintroduce the state
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    projectId: number;
    projectName: string;
  } | null>(null);
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [editProjectData, setEditProjectData] = useState<{
    id: number;
    name: string;
    description: string;
    startDate: string; // Ensure this is a string
    endDate: string; // Ensure this is a string
  } | null>(null);
  const [expandedDescriptions, setExpandedDescriptions] = useState<Record<number, boolean>>({});
  const [filterCriteria, setFilterCriteria] = useState<{
    taskCount?: "asc" | "desc";
    status?: "No Tasks" | "In Progress" | "Completed";
    dueDate?: "asc" | "desc";
  }>({});

  const { data: projects, isError, refetch } = api.project.getAllProjects.useQuery();

  const deleteProject = api.project.deleteProject.useMutation({
    onMutate: ({ id }) => setLoadingProjectId(id), // Reintroduce the onMutate handler
    onSuccess: () => {
      setDeleteConfirmation(null);
      refetch();
    },
    onSettled: () => setLoadingProjectId(null), // Reintroduce the onSettled handler
  });

  const updateProject = api.project.updateProject.useMutation({
    onSuccess: () => {
      refetch();
      setIsEditingProject(false);
      setEditProjectData(null);
    },
  });

  const getProjectStatus = useCallback((tasks: any) => {
    if (tasks.length === 0) return "No Tasks";
    return tasks.every((task: any) => task.status === TaskStatus.COMPLETED) ? "Completed" : "In Progress";
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
    startDate: Date | null; // Allow null
    endDate: Date | null; // Allow null
  }) => {
    setEditProjectData({
      ...project,
      startDate: project.startDate?.toISOString().split("T")[0] || "", // Default to empty string if null
      endDate: project.endDate?.toISOString().split("T")[0] || "", // Default to empty string if null
    });
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
        <Header />

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

          <Filter setFilterCriteria={setFilterCriteria} />
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
            <ProjectCard
              key={project.id}
              project={{
                ...project,
                description: project.description || "No description available", // Default value if null
                startDate: project.startDate ? new Date(project.startDate) : null, // Default to null if undefined
                endDate: project.endDate ? new Date(project.endDate) : null, // Default to null if undefined
              }}
              expandedDescriptions={expandedDescriptions}
              toggleDescription={toggleDescription}
              handleEditProject={handleEditProject}
              handleDeleteConfirmation={handleDeleteConfirmation}
              setSelectedProject={setSelectedProject}
              setShowTaskModal={setShowTaskModal}
              getProjectStatus={getProjectStatus}
            />
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

<DeleteConfirmationModal
  deleteConfirmation={deleteConfirmation}
  setDeleteConfirmation={setDeleteConfirmation}
  handleDeleteProject={handleDeleteProject}
  loadingProjectId={loadingProjectId} // Pass the prop
/>
    </Layout>
  );
};

export default Dashboard;