import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line, Pie, Scatter } from 'react-chartjs-2';
import { Chart as ChartJS } from 'chart.js/auto';
import Layout from "../components/Layout";

const Reports = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [patientId, setPatientId] = useState('');
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5002/patients')
      .then(response => setPatients(response.data))
      .catch(error => console.error(error));
  }, []);

  useEffect(() => {
    setLoading(true);
    const url = patientId
      ? `http://localhost:5002/api/reports?patientId=${patientId}`
      : 'http://localhost:5002/api/reports';
    axios.get(url)
      .then(response => {
        setReportData(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error(error);
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
        tension: 0.1,
        fill: false,
      },
      {
        label: 'Average Stress Level',
        data: reportData.timeSeries.map(item => item.avgStress),
        tension: 0.1,
        fill: false,
      },
    ],
  };

  const { diarrhea = 0, constipation = 0, normal = 0 } = reportData.summary.bowelDistribution || {};
  const pieData = {
    labels: ['Diarrhea', 'Constipation', 'Normal'],
    datasets: [
      {
        data: [diarrhea, constipation, normal],
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
      },
    ],
  };

  const scatterData = {
    datasets: [
      {
        label: 'Logs (Pain vs Stress)',
        data: reportData.summary.painStressPairs || [],
        showLine: false,
        pointRadius: 4,
      },
    ],
  };

  return (
    <Layout>
      <div className="container mt-5">
        <h2>Symptom Trends</h2>
        <div className="row mb-3">
          <div className="col-md-4">
            <label htmlFor="patientSelect">Filter by Patient</label>
            <select
              id="patientSelect"
              className="form-control"
              value={patientId}
              onChange={e => setPatientId(e.target.value)}
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
        <div style={{ maxWidth: 600, margin: '2rem auto' }}>
          <Line data={chartData} />
        </div>
        <div style={{ maxWidth: 400, margin: '2rem auto' }}>
          <h3>Bowel-Movement Breakdown</h3>
          <Pie data={pieData} />
        </div>
        <div style={{ maxWidth: 500, margin: '2rem auto' }}>
          <h3>Pain vs Stress Correlation</h3>
          <Scatter
            data={scatterData}
            options={{
              scales: {
                x: { title: { display: true, text: 'Pain Level' } },
                y: { title: { display: true, text: 'Stress Level' } },
              },
            }}
          />
        </div>
        <div className="mt-4">
          <h4>Summary</h4>
          <p><strong>Average Pain:</strong> {reportData.summary.avgPain}</p>
          <p><strong>Average Stress:</strong> {reportData.summary.avgStress}</p>
          <p><strong>Total Logs:</strong> {reportData.summary.logsCount}</p>
          <p><strong>Most Common Bowel Movement:</strong> {reportData.summary.mostCommonBowel}</p>
        </div>
      </div>
    </Layout>
  );
};

export default Reports;
