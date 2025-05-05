import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { Bell, PersonCircle, HouseDoor, ClipboardCheck, BarChart, Gear } from "react-bootstrap-icons";
import "bootstrap/dist/css/bootstrap.min.css";

const PatientProfile = () => {
  const { patientId } = useParams();
  const [patient, setPatient] = useState(null);
  const [symptoms, setSymptoms] = useState([]);
  const [healthData, setHealthData] = useState({});
  const [sortOrder, setSortOrder] = useState("desc");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [showMealPlanModal, setShowMealPlanModal] = useState(false);
  const [mealPlan, setMealPlan] = useState({
    Day1: { Breakfast: "", Lunch: "", Dinner: "" },
    Day2: { Breakfast: "", Lunch: "", Dinner: "" },
    Day3: { Breakfast: "", Lunch: "", Dinner: "" },
    Day4: { Breakfast: "", Lunch: "", Dinner: "" },
    Day5: { Breakfast: "", Lunch: "", Dinner: "" },
    Day6: { Breakfast: "", Lunch: "", Dinner: "" },
    Day7: { Breakfast: "", Lunch: "", Dinner: "" },
  });
  const [showMedicationModal, setShowMedicationModal] = useState(false);
  const [medPlan, setMedPlan] = useState({
    Day1: { Medication: "" },
    Day2: { Medication: "" },
    Day3: { Medication: "" },
    Day4: { Medication: "" },
    Day5: { Medication: "" },
    Day6: { Medication: "" },
    Day7: { Medication: "" },
  });

  useEffect(() => {
    axios.get(`http://localhost:5002/patients/${patientId}`)
      .then(res => {
        setPatient(res.data.patient);
        setSymptoms(res.data.symptoms);
      })
      .catch(() => setErrorMessage("Failed to load patient data."));
    axios.get(`http://localhost:5002/api/health/${patientId}`)
      .then(res => setHealthData(res.data))
      .catch(() => setHealthData({}))
      .finally(() => setIsLoading(false));
  }, [patientId]);

  const formatDate = timestamp => {
    if (!timestamp) return "";
    if (timestamp._seconds) return new Date(timestamp._seconds * 1000).toLocaleDateString();
    if (timestamp.seconds) return new Date(timestamp.seconds * 1000).toLocaleDateString();
    return new Date(timestamp).toLocaleDateString();
  };

  const getTime = t => {
    if (!t) return 0;
    if (t._seconds) return t._seconds * 1000;
    if (t.seconds) return t.seconds * 1000;
    return new Date(t).getTime();
  };

  const sortedSymptoms = [...symptoms].sort((a, b) => (
    sortOrder === "asc"
      ? getTime(a.timestamp) - getTime(b.timestamp)
      : getTime(b.timestamp) - getTime(a.timestamp)
  ));

  const handleInputChange = (day, meal, e) => {
    setMealPlan({
      ...mealPlan,
      [day]: {
        ...mealPlan[day],
        [meal]: e.target.value,
      },
    });
  };

  const handleSubmitMealPlan = async () => {
    try {
      await axios.post("http://localhost:5002/api/mealPlans", { patientId, mealPlan });
      alert("Meal plan created successfully!");
      setShowMealPlanModal(false);
    } catch {
      alert("Error creating meal plan");
    }
  };

  const handleMedicationChange = (day, e) => {
    setMedPlan({
      ...medPlan,
      [day]: { Medication: e.target.value },
    });
  };

  const handleSubmitMedicationPlan = async () => {
    try {
      await axios.post("http://localhost:5002/api/medicationPlans", { patientId, medicationPlan: medPlan });
      alert("Medication plan created successfully!");
      setShowMedicationModal(false);
    } catch {
      alert("Error creating medication plan");
    }
  };

  if (isLoading) return <p>Loading...</p>;
  if (errorMessage) return <p>{errorMessage}</p>;
  if (!patient) return <p>No patient data available.</p>;

  return (
    <div className="d-flex">
      <div className="d-flex flex-column bg-dark text-white p-3" style={{ width: "250px", minHeight: "100vh" }}>
        <h4 className="text-primary fw-bold">Gut2Go</h4>
        <ul className="nav flex-column">
          <li className="nav-item">
            <Link className="nav-link text-white d-flex align-items-center" to="/">
              <HouseDoor size={20} className="me-2" /> Dashboard
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link text-white d-flex align-items-center" to="/patients">
              <ClipboardCheck size={20} className="me-2" /> My Patients
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link text-white d-flex align-items-center" to="/reports">
              <BarChart size={20} className="me-2" /> Reports
            </Link>
          </li>
        </ul>
      </div>
      <div className="flex-grow-1">
        <nav className="navbar navbar-light bg-white shadow-sm mb-4 px-4 py-3 d-flex justify-content-between">
          <h3 className="fw-bold text-dark">Patient Profile</h3>
          <div className="d-flex align-items-center">
            <Bell size={22} className="me-3" />
            <PersonCircle size={30} />
          </div>
        </nav>
        <div className="container-fluid p-4">
          <div className="card mb-4">
            <div className="card-body">
              <h3>Patient Profile</h3>
              <div className="d-flex mb-4">
                <img src={`https://i.pravatar.cc/100?u=${patientId}`} alt={patient.name} className="rounded-circle me-3" width="100" height="100"/>
                <div>
                  <h4>{patient.name}</h4>
                  <p><strong>Email:</strong> {patient.email}</p>
                </div>
              </div>
              <div className="row mb-4">
                <div className="col-md-4"><div className="card border-primary"><div className="card-body"><h5>Today's Steps</h5><p>{healthData.steps||0}</p></div></div></div>
                <div className="col-md-4"><div className="card border-primary"><div className="card-body"><h5>Today's Sleep (hrs)</h5><p>{healthData.sleepHours||0}</p></div></div></div>
                <div className="col-md-4"><div className="card border-primary"><div className="card-body"><h5>Avg Heart Rate</h5><p>{healthData.heartRateAvg||0}</p></div></div></div>
              </div>
              <div className="mt-4">
                <button className="btn btn-secondary me-2" onClick={() => setShowMealPlanModal(true)}>
                  Create Meal Plan
                </button>
                <button className="btn btn-secondary" onClick={() => setShowMedicationModal(true)}>
                  Create Medication Plan
                </button>
              </div>
              <h5 className="mt-4">Patient History</h5>
              <div className="d-flex align-items-center mb-2">
                <label className="me-2">Sort by Date:</label>
                <button className="btn btn-sm btn-outline-primary" onClick={() => setSortOrder(prev => prev === "asc" ? "desc" : "asc")}>
                  {sortOrder === "asc" ? "Oldest first" : "Newest first"}
                </button>
              </div>
              {sortedSymptoms.length === 0 ? (
                <p>No symptoms logged yet.</p>
              ) : (
                <div className="table-responsive mt-3">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Pain Level</th>
                        <th>Stress Level</th>
                        <th>Bowel Movements</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedSymptoms.map((symptom, i) => (
                        <tr key={i}>
                          <td>{formatDate(symptom.timestamp)}</td>
                          <td>{symptom.painLevel}</td>
                          <td>{symptom.stressLevel}</td>
                          <td>{symptom.bowelMovements}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {showMealPlanModal && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: "rgba(0, 0, 0, 0.5)", zIndex: 1050 }} onClick={() => setShowMealPlanModal(false)}>
          <div className="bg-white p-4 rounded shadow" style={{ width: "600px", maxHeight: "90%", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
            <h5>Create Meal Plan</h5>
            <form>
              {Object.keys(mealPlan).map((day, idx) => (
                <div key={idx} className="mb-3">
                  <h6>{day}</h6>
                  {["Breakfast", "Lunch", "Dinner"].map(meal => (
                    <div key={meal}>
                      <label>{meal}</label>
                      <input type="text" className="form-control" value={mealPlan[day][meal]} onChange={e => handleInputChange(day, meal, e)} placeholder={`Enter ${meal} for ${day}`} />
                    </div>
                  ))}
                </div>
              ))}
              <div className="d-flex justify-content-end">
                <button type="button" className="btn btn-secondary me-2" onClick={() => setShowMealPlanModal(false)}>Cancel</button>
                <button type="button" className="btn btn-primary" onClick={handleSubmitMealPlan}>Submit Meal Plan</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showMedicationModal && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: "rgba(0, 0, 0, 0.5)", zIndex: 1050 }} onClick={() => setShowMedicationModal(false)}>
          <div className="bg-white p-4 rounded shadow" style={{ width: "600px", maxHeight: "90%", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
            <h5>Create Medication Plan</h5>
            <form>
              {Object.keys(medPlan).map((day, idx) => (
                <div key={idx} className="mb-3">
                  <h6>{day}</h6>
                  <input type="text" className="form-control" value={medPlan[day].Medication} onChange={e => handleMedicationChange(day, e)} placeholder={`Enter Medication for ${day}`} />
                </div>
              ))}
              <div className="d-flex justify-content-end">
                <button type="button" className="btn btn-secondary me-2" onClick={() => setShowMedicationModal(false)}>Cancel</button>
                <button type="button" className="btn btn-primary" onClick={handleSubmitMedicationPlan}>Submit Medication Plan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientProfile;
