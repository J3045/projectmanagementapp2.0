import { motion } from "framer-motion";
import { useSession } from "next-auth/react";

export const Header = () => {
  const { data: session } = useSession();

  return (
    <motion.div
      className="flex justify-between items-center mb-12 p-8 rounded-xl bg-gradient-to-r from-gray-700 via-gray-800 to-gray-900 shadow-lg text-white"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div>
        <h1 className="text-4xl font-bold">
          Welcome back, <span className="text-indigo-400">{session?.user?.name || "User"}</span>!
        </h1>
        <p className="mt-2 text-lg text-gray-300">Track your projects and tasks effortlessly</p>
      </div>
    </motion.div>
  );
};