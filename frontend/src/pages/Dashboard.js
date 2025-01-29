import React, { useState, useEffect } from "react";
import axios from "axios";
import { Container, Card, CardContent, Typography, Button, Dialog, DialogTitle, DialogContent, IconButton, Grid } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import HistoryIcon from "@mui/icons-material/History";
import SymptomChart from "../components/SymptomChart"

const Dashboard = () => {
    const [patients, setPatients] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [symptoms, setSymptoms] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        axios.get("http://localhost:5002/patients")
            .then(response => setPatients(response.data))
            .catch(error => console.error("Error fetching patients:", error));
    }, []);

    const fetchSymptoms = (userId) => {
        axios.get(`http://localhost:5002/patients/${userId}/symptoms`)
            .then(response => {
                setSymptoms(response.data);
                setSelectedPatient(userId);
                setIsModalOpen(true);
            })
            .catch(error => console.error("Error fetching symptoms:", error));
    };

    return (
        <Container>
            <Typography variant="h4" style={{ marginTop: 20, fontWeight: "bold", textAlign: "center" }}>
                Doctor Dashboard
            </Typography>

            <Grid container spacing={3} style={{ marginTop: 20 }}>
                {patients.map(patient => (
                    <Grid item xs={12} sm={6} md={4} key={patient.id}>
                        <Card variant="outlined">
                            <CardContent>
                                <Typography variant="h6" style={{ fontWeight: "bold" }}>{patient.name}</Typography>
                                <Typography variant="body2" color="textSecondary">{patient.email}</Typography>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    startIcon={<HistoryIcon />}
                                    onClick={() => fetchSymptoms(patient.id)}
                                    style={{ marginTop: 10 }}
                                >
                                    View Symptoms
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* MODAL FOR SYMPTOM HISTORY */}
            <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>
                    Symptom History
                    <IconButton style={{ float: "right" }} onClick={() => setIsModalOpen(false)}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    {symptoms.length > 0 ? (
  <>
      <SymptomChart symptoms={symptoms} />
      {symptoms.map(symptom => (
          <Card key={symptom.id} variant="outlined" style={{ marginBottom: 10, padding: 10 }}>
              <Typography variant="subtitle1"><strong>Date:</strong> {new Date(symptom.timestamp).toLocaleString()}</Typography>
              <Typography variant="body2"><strong>Pain Level:</strong> {symptom.painLevel}</Typography>
              <Typography variant="body2"><strong>Bloating:</strong> {symptom.bloating ? "Yes" : "No"}</Typography>
              <Typography variant="body2"><strong>Stress Level:</strong> {symptom.stressLevel}</Typography>
          </Card>
      ))}
  </>
) : (
  <Typography variant="body1" color="textSecondary">No symptoms recorded for this patient.</Typography>
)}
                </DialogContent>
            </Dialog>
        </Container>
    );
};

export default Dashboard;
