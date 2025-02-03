import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const PatientProfile = () => {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [symptoms, setSymptoms] = useState([]);

  useEffect(() => {
    axios
      .get(`http://localhost:5002/patients/${id}`)
      .then((res) => setPatient(res.data))
      .catch((err) => console.error("Error fetching patient:", err));

    axios
      .get(`http://localhost:5002/patients/${id}/symptoms`)
      .then((res) => setSymptoms(res.data))
      .catch((err) => console.error("Error fetching symptoms:", err));
  }, [id]);

  if (!patient) {
    return <div className="text-center mt-5 fs-5 fw-semibold">Loading...</div>;
  }

  return (
    <div className="container mt-5">
      <div className="card shadow-lg p-4">
        <h2 className="text-primary fw-bold">{patient.name}</h2>
        <p className="text-muted">{patient.email}</p>

        <h3 className="fw-semibold mt-4">Symptom History</h3>
        {symptoms.length > 0 ? (
          <ul className="list-group mt-3">
            {symptoms.map((symptom, index) => (
              <li key={index} className="list-group-item">
                <p><strong>Date:</strong> {new Date(symptom.timestamp).toLocaleDateString()}</p>
                <p><strong>Pain Level:</strong> {symptom.painLevel}</p>
                <p><strong>Bloating:</strong> {symptom.bloating ? "Yes" : "No"}</p>
                <p><strong>Stress Level:</strong> {symptom.stressLevel}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted mt-3">No symptoms recorded.</p>
        )}
      </div>
    </div>
  );
};

export default PatientProfile;
