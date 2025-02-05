import { useState } from "react";
import { api } from "~/utils/api";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";

const AddProjectForm = ({ onClose, refetch }: { onClose: () => void; refetch: () => void }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const createProject = api.project.createProject.useMutation({
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
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    createProject.mutate({ name, description, startDate, endDate });
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
          <h2 className="text-2xl font-bold text-gray-800">Create New Project</h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900 transition transform hover:scale-110 text-3xl leading-none"
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
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-500 transition transform hover:scale-105"
          >
            Create Project
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default AddProjectForm;
