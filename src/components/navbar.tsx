import { signOut, useSession } from "next-auth/react"; 
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";

const Navbar = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Function to toggle dropdown
  const toggleDropdown = () => setDropdownOpen((prev) => !prev);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Page titles mapping
  const pageTitles: Record<string, string> = {
    "/dashboard": "Dashboard",
    "/projects": "Projects",
    "/teams": "Teams",
    "/settings": "Settings",
  };

  const isProjectPage = router.pathname.startsWith("/projects/");
  const currentPage = isProjectPage ? "Project Details" : pageTitles[router.pathname] ?? "Your App";

  return (
    <motion.nav
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex justify-between items-center bg-gradient-to-r from-purple-700 via-purple-800 to-purple-900 text-white border-b-2 border-purple-600 p-4 shadow-lg relative"
    >
      <h1 className="text-2xl font-semibold text-white drop-shadow-lg">{currentPage}</h1>

      <div className="flex items-center gap-4">
        {session?.user && (
          <div className="relative flex items-center gap-2">
            <span className="text-gray-200 font-medium">{session.user.name}</span>
            {session.user.image ? (
              <Image
                src={session.user.image}
                alt="User Profile"
                width={40}
                height={40}
                className="rounded-full border-4 border-purple-500 shadow-lg cursor-pointer hover:scale-105 transition"
                onClick={toggleDropdown}
              />
            ) : (
              <div
                className="w-10 h-10 bg-purple-500 text-white font-bold rounded-full flex items-center justify-center cursor-pointer border-4 border-purple-500 shadow-lg"
                onClick={toggleDropdown}
              >
                {session.user.name?.[0] || "U"}
              </div>
            )}
          </div>
        )}
      </div>

      {dropdownOpen && (
        <div
          ref={dropdownRef}
          className="absolute top-16 right-4 bg-purple-800 text-white shadow-xl rounded-lg w-48 border border-purple-600 z-50"
        >
          <ul className="text-gray-200">
            <li
              className="px-4 py-2 hover:bg-purple-700 cursor-pointer"
              onClick={() => signOut({ callbackUrl: "/auth/signin" })}
            >
              Sign Out
            </li>
          </ul>
        </div>
      )}
    </motion.nav>
  );
};

export default Navbar;