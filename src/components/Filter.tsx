import { useState, useRef, useEffect } from "react";
import { FaFilter } from "react-icons/fa";

interface FilterCriteria {
    taskCount?: "asc" | "desc";
    status?: "No Tasks" | "In Progress" | "Completed";
    dueDate?: "asc" | "desc";
  }

interface FilterProps {
  setFilterCriteria: (criteria: FilterCriteria) => void;
}

export const Filter = ({ setFilterCriteria }: FilterProps) => {
  const [showFilters, setShowFilters] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setShowFilters(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
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
                setFilterCriteria({
                    taskCount: e.target.value as "asc" | "desc",
                  })
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
                setFilterCriteria(({
                    taskCount: e.target.value as "asc" | "desc",
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
                setFilterCriteria(({
                    taskCount: e.target.value as "asc" | "desc",
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
  );
};