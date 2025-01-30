import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";

const Navbar = () => {
  const { data: session } = useSession();
  const router = useRouter();

  // Mapping paths to dynamic titles
  const pageTitles: { [key: string]: string } = {
    "/dashboard": "Dashboard",
    "/projects": "Projects",
    "/teams": "Teams",
    "/settings": "Settings",
  };

  const currentPage = pageTitles[router.pathname] || "Your App";

  return (
    <motion.nav
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex justify-between items-center bg-white border-b p-4 shadow-md text-gray-900"
    >
      {/* Dynamic Page Title */}
      <h1 className="text-2xl font-semibold">{currentPage}</h1>

      <div className="flex items-center gap-6">
        {session && (
          <div className="flex items-center gap-4">
            {/* User Profile Image */}
            {session.user.image && (
              <img
                src={session.user.image}
                alt="User Profile"
                className="w-10 h-10 rounded-full border-2 border-gray-300 shadow-md"
              />
            )}

            {/* User Name */}
            <p className="text-sm font-medium">{session.user.name}</p>
          </div>
        )}

        {/* Sign Out Button */}
        <button
          onClick={() => signOut()}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-all"
        >
          Sign Out
        </button>
      </div>
    </motion.nav>
  );
};

export default Navbar;
