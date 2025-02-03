import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const PatientProfile = () => {
    const { patientId } = useParams();
    const [patient, setPatient] = useState(null);
    const [notes, setNotes] = useState("");
    const [existingNotes, setExistingNotes] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        axios.get(`http://localhost:5003/patients/${patientId}`)
            .then(response => setPatient(response.data))
            .catch(error => console.error("Error fetching patient:", error));

        axios.get(`http://localhost:5003/patients/${patientId}/notes`)
            .then(response => setExistingNotes(response.data))
            .catch(error => console.error("Error fetching notes:", error));
    }, [patientId]);

    const handleSaveNote = () => {
        axios.post(`http://localhost:5003/patients/${patientId}/notes`, { note: notes })
            .then(response => {
                setExistingNotes([...existingNotes, response.data]);
                setNotes("");
            })
            .catch(error => console.error("Error saving note:", error));
    };

    if (!patient) return <p>Loading...</p>;

    return (
        <div>
            <h2>Patient Profile</h2>
            <p><strong>Name:</strong> {patient.name}</p>
            <p><strong>Email:</strong> {patient.email}</p>

            <h3>Doctor Notes</h3>
            <textarea 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Write notes here..."
                rows="4"
                cols="50"
            />
            <button onClick={handleSaveNote}>Save Note</button>

            <h3>Previous Notes</h3>
            <ul>
                {existingNotes.map((note, index) => (
                    <li key={index}>{note.text} - <em>{new Date(note.timestamp).toLocaleString()}</em></li>
                ))}
            </ul>

            {/* View Symptoms Button */}
            <button onClick={() => navigate(`/patients/${patientId}/symptoms`)}>View Symptoms</button>
        </div>
    );
};

export default PatientProfile;
