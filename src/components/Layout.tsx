import { ReactNode } from "react";
import Navbar from "./navbar";
import Sidebar from "./sidebar";

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-100 text-gray-900">
      {/* Sidebar should take full height and not be cut off */}
      <Sidebar />

      <div className="flex flex-1 flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 p-6 bg-white shadow-lg overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
