import { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa"; // Import close icon
import { api } from "~/utils/api"; // Corrected import for API from utils
import { TaskStatus, TaskPriority } from "@prisma/client"; // Import enums
import Select from "react-select"; // Import react-select
import { MultiValue } from "react-select"

interface AddTaskModalProps {
  projectId: number;
  onClose: () => void;
  refetchTasks: () => void; // Add refetchTasks prop to update the dashboard
}

const AddTaskModal = ({ projectId, onClose, refetchTasks }: AddTaskModalProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedUserIds, setAssignedUserIds] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [status, setStatus] = useState<TaskStatus | null>(null); // Use enum type
  const [priority, setPriority] = useState<TaskPriority | null>(null); // Use enum type
  const [tags, setTags] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [points, setPoints] = useState<number | undefined>(undefined);
  const [users, setUsers] = useState<{ id: string; name: string | null }[]>([]);

  // Fetch users from the database
  const { data: userData } = api.user.getAllUsers.useQuery();

  useEffect(() => {
    if (userData) {
      setUsers(userData);
    }
  }, [userData]);

  // Prepare user options for react-select
  const userOptions = users.map((user) => ({
    value: user.id,
    label: user.name ?? "Unnamed User", // Fallback for null names
  }));

  interface UserOption {
    value: string;
    label: string;
  }
  
 
const handleUserChange = (selectedOptions: MultiValue<{ value: string; label: string }>) => {
  setAssignedUserIds(selectedOptions.map((option) => option.value));
};
  // Mutation for creating task
  const { mutate } = api.task.createTask.useMutation({
    onSuccess: () => {
      onClose();
      refetchTasks();
    },
    onError: (err) => {
      console.error("Error creating task:", err);
      alert(`Error creating task: ${err.message}`);
    },
  });

  // Status dot color based on the status value
  const statusDot = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.TO_DO:
        return "bg-gray-500"; // Gray dot for "To Do"
      case TaskStatus.IN_PROGRESS:
        return "bg-blue-500"; // Blue dot for "In Progress"
      case TaskStatus.IN_REVIEW:
        return "bg-orange-500"; // Orange dot for "Under Review"
      case TaskStatus.COMPLETED:
        return "bg-green-500"; // Green dot for "Completed"
      default:
        return "bg-gray-400"; // Default gray dot if no status
    }
  };

  // Priority dot color based on priority level
  const priorityDot = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.LOW:
        return "bg-green-500"; // Green dot for Low priority
      case TaskPriority.MEDIUM:
        return "bg-yellow-500"; // Yellow dot for Medium priority
      case TaskPriority.HIGH:
        return "bg-blue-500"; // Blue dot for High priority
      case TaskPriority.URGENT:
        return "bg-red-500"; // Red dot for Urgent priority
      default:
        return "bg-gray-400"; // Default gray dot if no priority
    }
  };

  const handleSubmit = () => {
    try {
      mutate({
        title,
        description,
        projectId,
        assignedUserIds,
        dueDate,
        status: status ?? undefined,
        priority: priority ?? undefined,
        tags,
        startDate,
        points,
      });
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-800 bg-opacity-70 flex justify-center items-center ">
      <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden">
        {/* Close Icon */}
        <div className="flex justify-end">
          <button onClick={onClose} className="text-gray-600 hover:text-gray-900">
            <FaTimes size={24} />
          </button>
        </div>

        <h2 className="text-3xl font-semibold mb-6 text-gray-800 text-center">Add New Task</h2>

        {/* Horizontal Form Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Title */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium">Title</label>
            <input
              type="text"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title"
            />
          </div>

          {/* Assigned Users (React-Select Multi-Select) */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium">Assigned Users</label>
            <Select
              isMulti
              options={userOptions}
              value={userOptions.filter((option) => assignedUserIds.includes(option.value))}
              onChange={handleUserChange}
              className="w-full"
              placeholder="Select users..."
            />
          </div>

          {/* Status (Dropdown) */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium">Status</label>
            <div className="flex items-center space-x-2">
              <select
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={status ?? ""}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
              >
                <option value="">Select Status</option>
                <option value={TaskStatus.TO_DO}>To Do</option>
                <option value={TaskStatus.IN_PROGRESS}>In Progress</option>
                <option value={TaskStatus.IN_REVIEW}>Under Review</option>
                <option value={TaskStatus.COMPLETED}>Completed</option>
              </select>
              {status && (
                <div
                  className={`w-4 h-4 rounded-full ${statusDot(status)}`}
                  title={status}
                />
              )}
            </div>
          </div>

          {/* Due Date */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium">Due Date</label>
            <input
              type="date"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={dueDate?.toISOString().split("T")[0] ?? ""}
              onChange={(e) => setDueDate(new Date(e.target.value))}
            />
          </div>

          {/* Priority (Dropdown) */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium">Priority</label>
            <div className="flex items-center space-x-2">
              <select
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={priority ?? ""}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
              >
                <option value="">Select Priority</option>
                <option value={TaskPriority.LOW}>Low</option>
                <option value={TaskPriority.MEDIUM}>Medium</option>
                <option value={TaskPriority.HIGH}>High</option>
                <option value={TaskPriority.URGENT}>Urgent</option>
              </select>
              {priority && (
                <div
                  className={`w-4 h-4 rounded-full ${priorityDot(priority)}`}
                  title={priority}
                />
              )}
            </div>
          </div>

          {/* Points (Dropdown) */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium">Points</label>
            <select
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={points ?? ""}
              onChange={(e) => setPoints(Number(e.target.value))}
            >
              <option value="">Select Points</option>
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={20}>20</option>
              <option value={25}>25</option>
            </select>
          </div>

          {/* Start Date */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium">Start Date</label>
            <input
              type="date"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={startDate?.toISOString().split("T")[0] ?? ""}
              onChange={(e) => setStartDate(new Date(e.target.value))}
            />
          </div>

          {/* Tags */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium">Tags</label>
            <input
              type="text"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Tags (comma separated)"
            />
          </div>
        </div>

        {/* Description (Full Width) */}
        <div className="mb-6">
          <label className="block text-gray-700 font-medium">Description</label>
          <textarea
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter task description"
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-between mt-6">
          <button
            className="bg-gray-300 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            onClick={handleSubmit}
          >
            Add Task
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddTaskModal;