import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { FaRegSmile, FaRegSadTear, FaExclamationCircle } from "react-icons/fa";

const PatientSymptoms = () => {
  const { patientId } = useParams();
  const [symptoms, setSymptoms] = useState([]);
  const [aggregatedData, setAggregatedData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    axios
      .get(`http://localhost:5002/patients/${patientId}/symptoms`)
      .then((response) => {
        setSymptoms(response.data.symptoms);
        setAggregatedData(response.data.aggregatedData);
        setIsLoading(false);
      })
      .catch((error) => {
        setErrorMessage("Failed to load symptoms.");
        setIsLoading(false);
      });
  }, [patientId]);

  const getPainIcon = (painLevel) => {
    if (painLevel >= 7) return <FaRegSadTear size={30} color="red" />;
    if (painLevel >= 4) return <FaExclamationCircle size={30} color="orange" />;
    return <FaRegSmile size={30} color="green" />;
  };

  const formatDate = (timestamp) => {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString();
  };

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
        <div className="card-deck">
          {symptoms.map((symptom, index) => (
            <div key={index} className="card shadow-sm p-3 mb-4">
              <div className="card-body">
                <h5 className="card-title">{formatDate(symptom.timestamp)}</h5>
                <p><strong>Pain Level:</strong> {symptom.painLevel}</p>
                <p><strong>Stress Level:</strong> {symptom.stressLevel}</p>
                <p><strong>Bowel Movements:</strong> {symptom.bowelMovements}</p>
                <div>{getPainIcon(symptom.painLevel)}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-5">
        <h3>Most Common Symptoms</h3>
        <p><strong>Most Common Bowel Movement:</strong> {aggregatedData.mostCommonBowel}</p>
        <p><strong>Average Pain Level:</strong> {aggregatedData.averagePain}</p>
        <p><strong>Average Stress Level:</strong> {aggregatedData.averageStress}</p>
      </div>
    </div>
  );
};

export default PatientSymptoms;
