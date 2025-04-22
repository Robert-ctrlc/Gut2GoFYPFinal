import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS } from 'chart.js/auto';

const Reports = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [patientId, setPatientId] = useState('');
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5002/patients')
      .then(response => {
        setPatients(response.data);
      })
      .catch(error => {
        console.error('Error fetching patients:', error);
      });
  }, []);

  useEffect(() => {
    setLoading(true);

    const url = patientId ? `http://localhost:5002/api/reports?patientId=${patientId}` : 'http://localhost:5002/api/reports';

    axios.get(url)
      .then(response => {
        setReportData(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching report data:', error);
        setLoading(false);
      });
  }, [patientId]);

  if (loading) return <div>Loading...</div>;

  const chartData = {
    labels: reportData.timeSeries.map(item => item.date),
    datasets: [
      {
        label: 'Average Pain Level',
        data: reportData.timeSeries.map(item => item.avgPain),
        borderColor: 'rgba(255, 99, 132, 1)',
        tension: 0.1,
        fill: false,
      },
      {
        label: 'Average Stress Level',
        data: reportData.timeSeries.map(item => item.avgStress),
        borderColor: 'rgba(54, 162, 235, 1)',
        tension: 0.1,
        fill: false,
      },
    ],
  };

  return (
    <div className="container mt-5">
      <h2>Symptom Trends</h2>
      <div className="row mb-3">
        <div className="col-md-4">
          <label htmlFor="patientSelect">Filter by Patient</label>
          <select
            id="patientSelect"
            className="form-control"
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
          >
            <option value="">All Patients</option>
            {patients.map(patient => (
              <option key={patient.uid} value={patient.uid}>
                {patient.name || patient.email}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <Line data={chartData} />
      
      <div className="mt-4">
        <h4>Summary</h4>
        <p><strong>Average Pain:</strong> {reportData.summary.avgPain}</p>
        <p><strong>Average Stress:</strong> {reportData.summary.avgStress}</p>
        <p><strong>Total Logs:</strong> {reportData.summary.logsCount}</p>
        <p><strong>Most Common Bowel Movement:</strong> {reportData.summary.mostCommonBowel}</p>
      </div>
    </div>
  );
};

export default Reports;
