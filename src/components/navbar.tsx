import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import Image from "next/image"; // Import next/image

const Navbar = () => {
  const { data: session } = useSession();
  const router = useRouter();

  // Mapping paths to dynamic titles
  const pageTitles: Record<string, string> = {
    "/dashboard": "Dashboard",
    "/projects": "Projects",
    "/teams": "Teams",
    "/settings": "Settings",
  };
  

  // Dynamic path check for individual projects
  const isProjectPage = router.pathname.startsWith("/projects/");
  const currentPage = isProjectPage
    ? "Project Details" // You can customize this title for project pages
    : pageTitles[router.pathname] ?? "Your App";

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
        {session && session.user && (
          <div className="flex items-center gap-4">
            {/* User Profile Image or Default Image */}
            {session.user.image ? (
              <Image
              src={session.user.image}
              alt="User Profile"
              width={40}
              height={40}
              className="rounded-full border-2 border-gray-300 shadow-md"
            />
            ) : (
              // Show default icon or avatar if no profile image
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-white font-medium">
                  {session.user.name ? session.user.name[0] : "U"}
                </span>
              </div>
            )}

            {/* User Name */}
            <p className="text-sm font-medium">{session.user.name ?? "User"}</p>
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
