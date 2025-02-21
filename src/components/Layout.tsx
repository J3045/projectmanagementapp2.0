import { ReactNode } from "react";
import Navbar from "./navbar";
import Sidebar from "./sidebar";


interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-100 text-gray-900">
    

      {/* Sidebar - Fixed height and full height */}
      <div className="h-screen sticky top-0">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-h-screen overflow-hidden">
        {/* Navbar */}
        <Navbar />

        {/* Main Content - Scrollable */}
        <main className="flex-1 p-6 bg-white shadow-lg overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;