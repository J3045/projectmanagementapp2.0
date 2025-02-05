import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/router";
import { api } from "~/utils/api"; // Import trpc hook for fetching data
import { FaSpinner } from 'react-icons/fa'; // You can use any spinner icon here
import { FaHome, FaTh, FaUsers, FaCog, FaChevronLeft, FaChevronRight } from 'react-icons/fa'; // Import icons from react-icons

interface Project {
  id: number;
  name: string;
}

const Sidebar = () => {
  const [expanded, setExpanded] = useState(true); // For the sidebar expansion
  const [projectsOpen, setProjectsOpen] = useState(false); // State for toggling the "Projects" submenu
  const router = useRouter();

  // Use trpc hook to fetch projects from your API
  const { data: projects, isLoading, error } = api.project.getAllProjects.useQuery();

  const menuItems = [
    { name: "Dashboard", icon: <FaHome />, href: "/dashboard" },
    { name: "Projects", icon: <FaTh />, href: "/projects" },
    { name: "Teams", icon: <FaUsers />, href: "/teams" },
    { name: "Settings", icon: <FaCog />, href: "/settings" },
  ];

  // Loading state
  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-800">
        <div className="flex items-center gap-2 text-white">
          <FaSpinner className="animate-spin" size={24} />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-800 text-white">
        <span>Error loading projects: {error.message}</span>
      </div>
    );
  }

  const handleProjectClick = (e: React.MouseEvent) => {
    // Prevent the default navigation when clicking on the "Projects" main link
    e.preventDefault();
    setProjectsOpen(!projectsOpen); // Toggle the submenu visibility
  };

  return (
    <motion.aside
      initial={{ width: 80 }}
      animate={{ width: expanded ? 250 : 80 }}
      className="h-screen bg-gray-900 text-white p-4 flex flex-col shadow-lg"
    >
      {/* Expand/Collapse Button with Icons */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="mb-6 p-2 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center"
      >
        {expanded ? <FaChevronLeft size={24} /> : <FaChevronRight size={24} />}
      </button>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-4">
        {menuItems.map(({ name, icon, href }) => (
          <div key={name}>
            {/* Main Menu Link */}
            {name === "Projects" ? (
              <button
                onClick={handleProjectClick}
                className={`flex items-center gap-3 p-3 rounded-lg w-full transition-all ${
                  router.pathname === href
                    ? "bg-blue-500 text-white"
                    : "hover:bg-gray-700 text-white"
                }`}
              >
                {icon}
                {expanded && <span>{name}</span>}
              </button>
            ) : (
              <Link
                href={href}
                className={`flex items-center gap-3 p-3 rounded-lg w-full transition-all ${
                  router.pathname === href
                    ? "bg-blue-500 text-white"
                    : "hover:bg-gray-700 text-white"
                }`}
              >
                {icon}
                {expanded && <span>{name}</span>}
              </Link>
            )}

            {/* Dynamic Sub-links for "Projects" */}
            {name === "Projects" && expanded && projectsOpen && (
              <div className="pl-8 mt-2 space-y-2">
                {projects?.map((project: Project) => (
                  <Link
                    key={project.id} // Ensure unique key with 'id'
                    href={`/projects/${project.id}`}
                    className={`block p-2 rounded-lg transition-all ${
                      router.pathname === `/projects/${project.id}`
                        ? "bg-blue-500 text-white" // Ensuring text color is white when selected
                        : "hover:bg-gray-700 text-white" // Default text color for unselected
                    }`}
                  >
                    {project.name} {/* Assuming the name is project.name */}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </motion.aside>
  );
};

export default Sidebar;