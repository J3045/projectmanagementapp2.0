import { useState } from "react";
import { api } from "~/utils/api";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { z } from "zod";

// Define Zod Schema for form validation
const projectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().min(1, "Project description is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
}).refine((data) => new Date(data.startDate) <= new Date(data.endDate), {
  message: "End date must be after start date",
  path: ["endDate"],
});

interface AddProjectFormProps {
  onClose: () => void;
  refetch: () => void;
  setIsAddingProject: React.Dispatch<React.SetStateAction<boolean>>;
  projectData?: {
    id: number;
    name: string;
    description: string;
    startDate: string;
    endDate: string;
  };
  onUpdate?: (updatedData: {
    id: number;
    name: string;
    description: string;
    startDate: string;
    endDate: string;
  }) => void;
}

const AddProjectForm: React.FC<AddProjectFormProps> = ({
  onClose,
  refetch,
  setIsAddingProject,
  projectData,
  onUpdate,
}) => {
  const [name, setName] = useState(projectData?.name || "");
  const [description, setDescription] = useState(projectData?.description || "");
  const [startDate, setStartDate] = useState(projectData?.startDate || "");
  const [endDate, setEndDate] = useState(projectData?.endDate || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createProject = api.project.createProject.useMutation({
    onMutate: () => {
      setIsSubmitting(true);
      setIsAddingProject(true);
    },
    onSuccess: () => {
      toast.success("🎉 Project created successfully!", {
        style: {
          background: "#4CAF50",
          color: "#fff",
          fontWeight: "bold",
          borderRadius: "8px",
          padding: "12px",
        },
      });
      refetch();
      onClose();
      setIsAddingProject(false);
    },
    onError: (error) => {
      toast.error("❌ Failed to create project!", {
        style: {
          background: "#D32F2F",
          color: "#fff",
          fontWeight: "bold",
          borderRadius: "8px",
          padding: "12px",
        },
      });
      console.error("Error creating project", error);
      setIsAddingProject(false);
    },
    onSettled: () => setIsSubmitting(false),
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      // Validate form data using Zod
      const validatedData = projectSchema.parse({ name, description, startDate, endDate });

      if (projectData && onUpdate) {
        onUpdate({ id: projectData.id, ...validatedData });
      } else {
        createProject.mutate(validatedData);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.errors.forEach((err) => toast.error(`❌ ${err.message}`));
      }
    }
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedStartDate = e.target.value;
    setStartDate(selectedStartDate);

    // Reset end date if it's earlier than the new start date
    if (endDate && new Date(selectedStartDate) > new Date(endDate)) {
      setEndDate("");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-lg shadow-2xl p-6 w-[90%] max-w-lg"
      >
        <div className="flex justify-between items-center border-b pb-4 mb-4">
          <h2 className="text-2xl font-bold text-gray-800">
            {projectData ? "Edit Project" : "Create New Project"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900 transition transform hover:scale-110 text-3xl leading-none"
            aria-label="Close form"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Project Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="Project Name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="Project Description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={handleStartDateChange}
                required
                className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                aria-label="Start Date"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                min={startDate} // Ensure end date cannot be earlier than start date
                disabled={!startDate} // Disable until start date is selected
                className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                aria-label="End Date"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 text-white font-semibold rounded-lg shadow-md transition transform ${
              isSubmitting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-500 hover:scale-105"
            }`}
          >
            {isSubmitting
              ? projectData
                ? "Updating..."
                : "Creating..."
              : projectData
              ? "Update Project"
              : "Create Project"}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default AddProjectForm;
