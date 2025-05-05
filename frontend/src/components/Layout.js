// Layout.js
import React from "react";
import { Link } from "react-router-dom";
import { Bell, PersonCircle, HouseDoor, ClipboardCheck, BarChart, Gear } from "react-bootstrap-icons"; 
import "bootstrap/dist/css/bootstrap.min.css";

const Layout = ({ children }) => {
  return (
    <div className="d-flex">
      {/* Sidebar */}
      <div className="d-flex flex-column bg-dark text-white p-3" style={{ width: "250px", minHeight: "100vh" }}>
        <h4 className="text-primary fw-bold">Gut2Go</h4>
        <ul className="nav flex-column">
          <li className="nav-item">
            <Link className="nav-link text-white d-flex align-items-center" to="/">
              <HouseDoor size={20} className="me-2" /> Dashboard
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link text-white d-flex align-items-center" to="/patients">
              <ClipboardCheck size={20} className="me-2" /> My Patients
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link text-white d-flex align-items-center" to="/reports">
              <BarChart size={20} className="me-2" /> Reports
            </Link>
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-grow-1">
        {/* Top Navbar */}
        <nav className="navbar navbar-light bg-white shadow-sm mb-4 px-4 py-3 d-flex justify-content-between">
          <h3 className="fw-bold text-dark">Gut2Go</h3>
          <div className="d-flex align-items-center">
            <Bell size={22} className="me-3" />
            <PersonCircle size={30} />
          </div>
        </nav>

        {/* Page Content */}
        <div className="container-fluid p-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;
