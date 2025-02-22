"use client";

import { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import { api } from "~/utils/api";
import { TaskStatus, TaskPriority } from "@prisma/client";
import Select from "react-select";
import { MultiValue } from "react-select";
import { toast } from "react-hot-toast";

// Define the Task type locally (or import it from a shared file)
type Task = {
  id: number;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  tags?: string;
  startDate?: string | null; // Updated to string | null
  dueDate?: string | null; // Updated to string | null
  points?: number;
  assignedUsers: { id: string; name: string | null }[];
};

interface AddTaskModalProps {
  projectId: number;
  onClose: () => void;
  refetchTasks: () => void;
  taskData?: Task | null; // Use the updated Task type
}

const AddTaskModal = ({ projectId, onClose, refetchTasks, taskData }: AddTaskModalProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedUserIds, setAssignedUserIds] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [status, setStatus] = useState<TaskStatus | null>(null);
  const [priority, setPriority] = useState<TaskPriority | null>(null);
  const [tags, setTags] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [points, setPoints] = useState<number | undefined>(undefined);
  const [users, setUsers] = useState<{ id: string; name: string | null }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch users from the database
  const { data: userData } = api.user.getAllUsers.useQuery();

  useEffect(() => {
    if (userData) {
      setUsers(userData);
    }
  }, [userData]);

  // Pre-fill form fields if taskData is provided (editing mode)
  useEffect(() => {
    if (taskData) {
      setTitle(taskData.title);
      setDescription(taskData.description ?? "");
      setAssignedUserIds(taskData.assignedUsers.map((user) => user.id));
      setDueDate(taskData.dueDate ? new Date(taskData.dueDate) : null); // Convert string to Date
      setStatus(taskData.status);
      setPriority(taskData.priority);
      setTags(taskData.tags ?? "");
      setStartDate(taskData.startDate ? new Date(taskData.startDate) : null); // Convert string to Date
      setPoints(taskData.points ?? undefined);
    } else {
      // Reset form fields if taskData is null (adding mode)
      setTitle("");
      setDescription("");
      setAssignedUserIds([]);
      setDueDate(null);
      setStatus(null);
      setPriority(null);
      setTags("");
      setStartDate(null);
      setPoints(undefined);
    }
  }, [taskData]);

  // Prepare user options for react-select
  const userOptions = users.map((user) => ({
    value: user.id,
    label: user.name ?? "Unnamed User",
  }));

  const handleUserChange = (selectedOptions: MultiValue<{ value: string; label: string }>) => {
    setAssignedUserIds(selectedOptions.map((option) => option.value));
  };

  // Mutation for creating or updating task
  const createTaskMutation = api.task.createTask.useMutation({
    onSuccess: () => {
      onClose();
      refetchTasks();
      toast.success("Task created successfully!");
    },
    onError: (err) => {
      console.error("Error creating task:", err);
      toast.error(`Error creating task: ${err.message}`);
    },
  });

  const updateTaskMutation = api.task.updateTask.useMutation({
    onSuccess: () => {
      onClose();
      refetchTasks();
      toast.success("Task updated successfully!");
    },
    onError: (err) => {
      console.error("Error updating task:", err);
      toast.error(`Error updating task: ${err.message}`);
    },
  });

  const handleSubmit = () => {
    try {
      if (!title.trim()) {
        toast.error("Task title is required!");
        return;
      }
      if (!status) {
        toast.error("Please select a task status.");
        return;
      }
      if (startDate && dueDate && startDate > dueDate) {
        toast.error("Due date must be after start date.");
        return;
      }
      setIsSubmitting(true);

      // Convert startDate and dueDate to Date | null
      const formattedStartDate = startDate ? new Date(startDate) : null;
      const formattedDueDate = dueDate ? new Date(dueDate) : null;

      const taskDataInput = {
        title,
        description,
        projectId,
        assignedUserIds,
        dueDate: formattedDueDate, // Use Date | null
        status: status ?? undefined,
        priority: priority ?? undefined,
        tags,
        startDate: formattedStartDate, // Use Date | null
        points,
      };

      if (taskData?.id) {
        // Update existing task
        updateTaskMutation.mutate({ id: taskData.id, ...taskDataInput }, {
          onSuccess: () => {
            refetchTasks(); // Refetch tasks after update
            onClose();
           
          },
        });
      } else {
        // Create new task
        createTaskMutation.mutate(taskDataInput, {
          onSuccess: () => {
            refetchTasks(); // Refetch tasks after creation
            onClose();
            toast.success("Task created successfully!");
          },
        });
      }
    } catch (error) {
      console.error("Error submitting task:", error);
      toast.error("Failed to submit task. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedStartDate = e.target.value ? new Date(e.target.value) : null;
    setStartDate(selectedStartDate);

    // Reset due date if it's earlier than the new start date
    if (dueDate && selectedStartDate && selectedStartDate > dueDate) {
      setDueDate(null);
    }
  };

  const handleDueDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDueDate = e.target.value ? new Date(e.target.value) : null;
    setDueDate(selectedDueDate);
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-800 bg-opacity-70 flex justify-center items-center">
      <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden">
        {/* Close Icon */}
        <div className="flex justify-end">
          <button onClick={onClose} className="text-gray-600 hover:text-gray-900">
            <FaTimes size={24} />
          </button>
        </div>

        <h2 className="text-3xl font-semibold mb-6 text-gray-800 text-center">
          {taskData ? "Edit Task" : "Add New Task"}
        </h2>

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
            <select
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={status ?? ""}
              onChange={(e) => setStatus(e.target.value as TaskStatus | null)}
            >
              <option value="">Select Status</option>
              <option value={TaskStatus.TO_DO}>To Do</option>
              <option value={TaskStatus.IN_PROGRESS}>In Progress</option>
              <option value={TaskStatus.IN_REVIEW}>Under Review</option>
              <option value={TaskStatus.COMPLETED}>Completed</option>
            </select>
          </div>

          {/* Priority (Dropdown) */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium">Priority</label>
            <select
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={priority ?? ""}
              onChange={(e) => setPriority(e.target.value as TaskPriority | null)}
            >
              <option value="">Select Priority</option>
              <option value={TaskPriority.LOW}>Low</option>
              <option value={TaskPriority.MEDIUM}>Medium</option>
              <option value={TaskPriority.HIGH}>High</option>
              <option value={TaskPriority.URGENT}>Urgent</option>
            </select>
          </div>

          {/* Start Date */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium">Start Date</label>
            <input
              type="date"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={startDate?.toISOString().split("T")[0] ?? ""}
              onChange={handleStartDateChange}
            />
          </div>

          {/* Due Date */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium">Due Date</label>
            <input
              type="date"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={dueDate?.toISOString().split("T")[0] ?? ""}
              onChange={handleDueDateChange}
              min={startDate?.toISOString().split("T")[0]} // Ensure due date cannot be earlier than start date
              disabled={!startDate} // Disable until start date is selected
            />
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
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all flex items-center justify-center"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </>
            ) : taskData ? "Update Task" : "Add Task"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddTaskModal;