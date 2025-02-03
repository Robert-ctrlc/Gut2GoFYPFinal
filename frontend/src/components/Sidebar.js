import { HomeIcon, UsersIcon, ChartBarIcon, CogIcon, LogoutIcon } from "@heroicons/react/outline";
import { Link } from "react-router-dom";

const Sidebar = () => {
  return (
    <div className="h-screen w-64 bg-gray-900 text-white flex flex-col">
      <h2 className="text-2xl font-bold text-center py-6">Gut2Go</h2>

      <nav className="flex-grow">
        <ul className="space-y-2 px-4">
          <li>
            <Link to="/" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800">
              <HomeIcon className="w-6 h-6" />
              <span>Dashboard</span>
            </Link>
          </li>
          <li>
            <Link to="/patients" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800">
              <UsersIcon className="w-6 h-6" />
              <span>Patients</span>
            </Link>
          </li>
          <li>
            <Link to="/reports" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800">
              <ChartBarIcon className="w-6 h-6" />
              <span>Reports</span>
            </Link>
          </li>
          <li>
            <Link to="/settings" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800">
              <CogIcon className="w-6 h-6" />
              <span>Settings</span>
            </Link>
          </li>
        </ul>
      </nav>

      {/* Logout Button */}
      <button className="flex items-center space-x-3 p-3 rounded-lg bg-red-500 hover:bg-red-600 m-4">
        <LogoutIcon className="w-6 h-6" />
        <span>Logout</span>
      </button>
    </div>
  );
};

export default Sidebar;
