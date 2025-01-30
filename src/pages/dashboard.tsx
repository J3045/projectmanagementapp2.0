import { useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Layout from "../components/Layout";

const Dashboard = () => {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!session) {
      router.push("/");
    }
  }, [session, router]);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
       

        {/* Welcome Message */}
        <p className="text-2xl mb-8 text-gray-700">
          Welcome back, <span className="font-bold text-gray-900">{session?.user?.name}</span>!
        </p>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {["Total Tasks", "Completed Tasks", "Pending Tasks"].map((title, index) => (
            <div key={index} className="bg-blue-100 p-6 rounded-lg text-center shadow-md">
              <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
              <p className="text-3xl font-bold text-blue-700">{index === 0 ? 24 : 12}</p>
            </div>
          ))}
        </div>

        {/* Task List */}
        <div className="bg-gray-200 p-6 rounded-lg mb-8 shadow-md">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Task List</h2>
          <div className="space-y-4">
            {[1, 2, 3].map((task) => (
              <div key={task} className="bg-white p-4 rounded-lg shadow">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-800">Task {task}</h3>
                  <span className="text-sm text-gray-600">Due: 2023-10-{task}</span>
                </div>
                <p className="text-sm text-gray-700 mt-2">
                  This is a detailed description of Task {task}.
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Project Timeline */}
        <div className="bg-gray-200 p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Project Timeline</h2>
          <div className="space-y-4">
            {[1, 2, 3].map((project) => (
              <div key={project} className="bg-white p-4 rounded-lg shadow">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-800">Project {project}</h3>
                  <span className="text-sm text-gray-600">Deadline: 2023-11-{project}</span>
                </div>
                <p className="text-sm text-gray-700 mt-2">
                  This is a detailed description of Project {project}.
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
