import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Search, Plus, ThreeDotsVertical, ClipboardCheck, Capsule, ListUl } from "react-bootstrap-icons";
import "bootstrap/dist/css/bootstrap.min.css";

const MyPatients = () => {
  const [patients, setPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    axios
      .get("http://localhost:5002/patients")
      .then((response) => setPatients(response.data))
      .catch((error) => console.error("Error fetching patients:", error));
  }, []);

  const filteredPatients = patients.filter((patient) =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container-fluid p-4">
      {/* Top Bar */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold">My Patients</h3>
        <div className="d-flex">
          <div className="input-group me-3">
            <span className="input-group-text bg-light"><Search /></span>
            <input
              type="text"
              placeholder="Search patients..."
              className="form-control"
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="btn btn-primary d-flex align-items-center">
            <Plus size={18} className="me-2" />
            Add New Patient
          </button>
        </div>
      </div>

      {/* Patient Cards */}
      <div className="row">
        {filteredPatients.map((patient) => (
          <div key={patient.id} className="col-md-6 mb-4">
            <div className="card shadow-sm p-3">
              <div className="d-flex justify-content-between">
                <div className="d-flex align-items-center">
                  <img
                    src={`https://i.pravatar.cc/100?u=${patient.id}`}
                    alt={patient.name}
                    className="rounded-circle me-3"
                    width="60"
                    height="60"
                  />
                  <div>
                    <h5 className="fw-bold mb-0">{patient.name}</h5>
                    <p className="text-muted small">Age: {patient.age}</p>
                  </div>
                </div>
                <ThreeDotsVertical size={20} className="text-secondary" />
              </div>

              {/* Patient Options */}
              <ul className="list-group list-group-flush mt-3">
                <li className="list-group-item d-flex align-items-center">
                  <ClipboardCheck size={18} className="me-2 text-primary" />
                  <Link to={`/patients/${patient.id}/symptoms`} className="text-decoration-none text-dark">
                    View Symptoms
                  </Link>
                </li>
                <li className="list-group-item d-flex align-items-center">
                  <Capsule size={18} className="me-2 text-primary" />
                  <Link to={`/patients/${patient.id}/medication`} className="text-decoration-none text-dark">
                    Medication Plan
                  </Link>
                </li>
                <li className="list-group-item d-flex align-items-center">
                  <ListUl size={18} className="me-2 text-primary" />
                  <Link to={`/patients/${patient.id}/meal`} className="text-decoration-none text-dark">
                    Meal Plan
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyPatients;
