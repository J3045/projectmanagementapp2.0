import { useState } from "react";
import { FaTrash, FaEdit, FaPlus, FaCalendarAlt, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { TaskStatus } from "@prisma/client";

interface Project {
  id: number;
  name: string;
  description: string;
  startDate: Date | null; // Allow null
  endDate: Date | null; // Allow null
  tasks: any[];
}

interface ProjectCardProps {
  project: Project;
  expandedDescriptions: Record<number, boolean>;
  toggleDescription: (projectId: number) => void;
  handleEditProject: (project: Project) => void;
  handleDeleteConfirmation: (projectId: number, projectName: string) => void;
  setSelectedProject: (projectId: number) => void;
  setShowTaskModal: (show: boolean) => void;
  getProjectStatus: (tasks: any[]) => string;
}

export const ProjectCard = ({
  project,
  expandedDescriptions,
  toggleDescription,
  handleEditProject,
  handleDeleteConfirmation,
  setSelectedProject,
  setShowTaskModal,
  getProjectStatus,
}: ProjectCardProps) => {
  const router = useRouter();

  return (
    <motion.div
      className="bg-white shadow-lg rounded-xl p-6 hover:shadow-2xl transition duration-300 border border-gray-100 flex flex-col justify-between"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
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
              startDate: project.startDate, // Pass as Date
              endDate: project.endDate, // Pass as Date
              tasks: project.tasks, // Include the tasks property
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
  );
};