import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const PatientSymptoms = () => {
    const { patientId } = useParams();
    const [symptoms, setSymptoms] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState(null);

    useEffect(() => {
        axios.get(`http://localhost:5002/patients/${patientId}/symptoms`)
            .then(response => {
                setSymptoms(response.data);
                setIsLoading(false);
            })
            .catch(error => {
                setErrorMessage("Failed to load symptoms.");
                setIsLoading(false);
            });
    }, [patientId]);

    if (isLoading) return <p>Loading symptoms...</p>;
    if (errorMessage) return <p>{errorMessage}</p>;

    return (
        <div>
            <h2>Symptom History</h2>
            {symptoms.length === 0 ? (
                <p>No symptoms logged yet.</p>
            ) : (
                <ul>
                    {symptoms.map((symptom) => (
                        <li key={symptom.id}>
                            <strong>Date:</strong> {symptom.timestamp ? new Date(symptom.timestamp).toLocaleDateString() : "N/A"}<br />
                            <strong>Pain Level:</strong> {symptom.painLevel}<br />
                            <strong>Bloating:</strong> {symptom.bloating ? "Yes" : "No"}<br />
                            <strong>Stress Level:</strong> {symptom.stressLevel}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default PatientSymptoms;
