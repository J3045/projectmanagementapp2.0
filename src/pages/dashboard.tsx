"use client";
import { useState } from "react"; // Removed useEffect since it's unused
import { useSession, signOut } from "next-auth/react";
import Layout from "../components/Layout";
import AddProjectForm from "~/components/AddProjectForm";
import AddTaskModal from "~/components/AddTaskModal";
import { api } from "~/utils/api";
import { type Task, TaskStatus } from "@prisma/client";

const Dashboard = () => {
  const { data: session } = useSession(); // Removed `status` since it's unused
  const [showModal, setShowModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);

  // Fetch projects using tRPC
  const { data: projects, isError, refetch } = api.project.getAllProjects.useQuery();
  // Removed `isLoading` since it's unused

  const handleSignOut = () => {
    void signOut({ callbackUrl: "/auth/signin" }); // Fixed: Handled async promise
  };

  // Function to determine project status based on tasks
  const getProjectStatus = (tasks: Task[]) => {
    if (tasks.length === 0) return "No Tasks";
    const allCompleted = tasks.every(
      (task) => task.status !== null && task.status === TaskStatus.COMPLETED
    );

    return allCompleted ? "Completed" : "In Progress";
  };

  if (isError) {
    return <div>Error fetching projects. Please try again later.</div>;
  }

  return (
    <Layout>
      <div className="container mx-auto py-12 px-6">
        {/* Dashboard Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <p className="text-2xl font-semibold text-gray-700">
              Welcome back, <span className="text-blue-600">{session?.user?.name}</span>!
            </p>
            <p className="text-lg text-gray-500">Here&apos;s your dashboard overview</p> {/* Fixed apostrophe */}
          </div>
          <button
            onClick={handleSignOut}
            className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition"
          >
            Sign Out
          </button>
        </div>

        {/* Button to open Add Project modal */}
        <div className="mb-6 flex justify-start">
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition duration-300"
          >
            + Create New Project
          </button>
        </div>

        {/* Modal for Add Project Form */}
        {showModal && <AddProjectForm onClose={() => setShowModal(false)} refetch={refetch} />}

        {/* Project Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {projects?.map((project) => (
            <div
              key={project.id}
              className="bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition duration-300"
            >
              <h3 className="text-xl font-semibold text-gray-700">{project.name}</h3>
              <p className="text-gray-500">{project.description}</p>

              <div className="mt-4 flex justify-between">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-gray-700">Tasks:</span>
                  <span className="text-gray-500">{project.tasks.length}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-gray-700">Team Members:</span>
                  <span className="text-gray-500">{project.teams.length}</span>
                </div>
              </div>

              <div className="mt-4">
                {/* Project Status */}
                <p
                  className={`text-sm ${
                    getProjectStatus(project.tasks) === "Completed"
                      ? "text-green-600"
                      : "text-yellow-600"
                  }`}
                >
                  Status: {getProjectStatus(project.tasks)}
                </p>
              </div>

              {/* Buttons to Add Team Members and Tasks */}
              <div className="mt-4 flex space-x-4">
                <button
                  onClick={() => alert(`Add team member to project ${project.name}`)}
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
                >
                  Add Team Member
                </button>
                <button
                  onClick={() => {
                    setSelectedProject(project.id);
                    setShowTaskModal(true);
                  }}
                  className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition"
                >
                  Add Task
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Task Modal */}
      {showTaskModal && selectedProject && (
        <AddTaskModal
          projectId={selectedProject}
          onClose={() => setShowTaskModal(false)}
          refetchTasks={refetch} // Pass the project refetch function
        />
      )}
    </Layout>
  );
};

export default Dashboard;
