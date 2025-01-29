import React from "react";
import { Line } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import moment from "moment"; 

Chart.register(...registerables);

const SymptomChart = ({ symptoms }) => {
   
    const formattedSymptoms = symptoms.map(symptom => ({
        ...symptom,
        timestamp: symptom.timestamp.toDate ? symptom.timestamp.toDate() : new Date(symptom.timestamp),
    }));

    
    const last7Days = moment().subtract(7, "days");
    const recentSymptoms = formattedSymptoms.filter(symptom => moment(symptom.timestamp).isAfter(last7Days));

    
    const labels = recentSymptoms.map(symptom => moment(symptom.timestamp).format("YYYY-MM-DD"));
    const painLevels = recentSymptoms.map(symptom => symptom.painLevel);
    const stressLevels = recentSymptoms.map(symptom => symptom.stressLevel);

    const data = {
        labels,
        datasets: [
            {
                label: "Pain Level",
                data: painLevels,
                borderColor: "rgba(255, 99, 132, 1)",
                backgroundColor: "rgba(255, 99, 132, 0.2)",
                tension: 0.3,
                fill: true,
            },
            {
                label: "Stress Level",
                data: stressLevels,
                borderColor: "rgba(54, 162, 235, 1)",
                backgroundColor: "rgba(54, 162, 235, 0.2)",
                tension: 0.3,
                fill: true,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: "top",
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 10,
            },
        },
    };

    return (
        <div>
            <h3>Symptom Trends (Last 7 Days)</h3>
            {recentSymptoms.length > 0 ? <Line data={data} options={options} /> : <p>No data for the last 7 days.</p>}
        </div>
    );
};

export default SymptomChart;
