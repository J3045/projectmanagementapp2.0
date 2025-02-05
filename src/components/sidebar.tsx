import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import { FaSpinner, FaHome, FaTh, FaUsers, FaCog, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import Image from "next/image";

interface Project {
  id: number;
  name: string;
}

const Sidebar = () => {
  const { data: session } = useSession();
  const [expanded, setExpanded] = useState(true);
  const [projectsOpen, setProjectsOpen] = useState(false);
  const router = useRouter();

  const { data: projects, isLoading, error } = api.project.getAllProjects.useQuery();

  const menuItems = [
    { name: "Dashboard", icon: <FaHome />, href: "/dashboard" },
    { name: "Projects", icon: <FaTh />, href: "/projects" },
    { name: "Teams", icon: <FaUsers />, href: "/teams" },
    { name: "Settings", icon: <FaCog />, href: "/settings" },
  ];

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
    e.preventDefault();
    setProjectsOpen(!projectsOpen);
  };

  return (
    <motion.aside
      initial={{ width: 80 }}
      animate={{ width: expanded ? 250 : 80 }}
      className="h-screen bg-gray-900 text-white p-4 flex flex-col shadow-lg relative transition-all"
    >
      {/* User Profile Section */}
      {session && session.user && (
        <div className="flex items-center gap-3 mb-6">
          {session.user.image ? (
            <Image
              src={session.user.image}
              alt="User Profile"
              width={40}
              height={40}
              className="rounded-full border-2 border-gray-300 shadow-md"
            />
          ) : (
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-white font-medium">
                {session.user.name ? session.user.name[0] : "U"}
              </span>
            </div>
          )}
          {expanded && <span className="text-lg font-medium">{session.user.name}</span>}
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 space-y-4">
        {menuItems.map(({ name, icon, href }) => (
          <div key={name}>
            {name === "Projects" ? (
              <button
                onClick={handleProjectClick}
                className={`flex items-center gap-3 p-3 rounded-lg w-full transition-all ${
                  router.pathname === href ? "bg-blue-600 text-white" : "hover:bg-gray-700 text-white"
                }`}
              >
                {icon}
                {expanded && <span>{name}</span>}
              </button>
            ) : (
              <Link
                href={href}
                className={`flex items-center gap-3 p-3 rounded-lg w-full transition-all ${
                  router.pathname === href ? "bg-blue-600 text-white" : "hover:bg-gray-700 text-white"
                }`}
              >
                {icon}
                {expanded && <span>{name}</span>}
              </Link>
            )}
            {name === "Projects" && expanded && projectsOpen && (
              <div className="pl-8 mt-2 space-y-2">
                {projects?.map((project: Project) => (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}`}
                    className={`block p-2 rounded-lg transition-all ${
                      router.pathname === `/projects/${project.id}` ? "bg-blue-600 text-white" : "hover:bg-gray-700 text-white"
                    }`}
                  >
                    {project.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Expand/Collapse Button */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="absolute top-1/2 right-[-16px] transform -translate-y-1/2 p-2 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 flex items-center justify-center transition-all"
      >
        {expanded ? <FaChevronLeft size={24} /> : <FaChevronRight size={24} />}
      </button>
    </motion.aside>
  );
};

export default Sidebar;
