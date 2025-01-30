import { useState } from "react";
import { motion } from "framer-motion";
import { Home, LayoutGrid, Settings, Users, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";

const Sidebar = () => {
  const [expanded, setExpanded] = useState(true);
  const router = useRouter();

  const menuItems = [
    { name: "Dashboard", icon: <Home />, href: "/dashboard" },
    { name: "Projects", icon: <LayoutGrid />, href: "/projects" },
    { name: "Teams", icon: <Users />, href: "/teams" },
    { name: "Settings", icon: <Settings />, href: "/settings" },
  ];

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
        {expanded ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
      </button>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-4">
        {menuItems.map(({ name, icon, href }) => (
          <Link
            key={name}
            href={href}
            className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
              router.pathname === href ? "bg-blue-500" : "hover:bg-gray-700"
            }`}
          >
            {icon}
            {expanded && <span>{name}</span>}
          </Link>
        ))}
      </nav>
    </motion.aside>
  );
};

export default Sidebar;
