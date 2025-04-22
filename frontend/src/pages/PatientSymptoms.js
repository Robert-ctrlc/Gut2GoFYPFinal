import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const PatientSymptoms = () => {
  const { patientId } = useParams();
  const [symptoms, setSymptoms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    // Fetch symptoms data directly without authentication
    axios
      .get(`http://localhost:5002/patients/${patientId}/symptoms`)
      .then((response) => {
        setSymptoms(response.data);
        setIsLoading(false);
      })
      .catch((error) => {
        setErrorMessage("Failed to load symptoms.");
        setIsLoading(false);
      });
  }, [patientId]);

  if (isLoading) {
    return <p>Loading symptoms...</p>;
  }

  if (errorMessage) {
    return <p>{errorMessage}</p>;
  }

  return (
    <div>
      <h2>Symptom History</h2>
      {symptoms.length === 0 ? (
        <p>No symptoms logged yet.</p>
      ) : (
        <ul>
          {symptoms.map((symptom, index) => (
            <li key={index}>
              <strong>{new Date(symptom.timestamp).toLocaleDateString()}</strong><br />
              <strong>Pain Level:</strong> {symptom.painLevel}<br />
              <strong>Stress Level:</strong> {symptom.stressLevel}<br />
              <strong>Bowel Movements:</strong> {symptom.bowelMovements}<br />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PatientSymptoms;
