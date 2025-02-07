import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import PatientProfile from "./pages/PatientProfile";
import MyPatients from "./pages/MyPatients"; 
import 'bootstrap/dist/css/bootstrap.min.css';
import PatientSymptoms from "./pages/PatientSymptoms";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/patients" element={<MyPatients />} />
        <Route path="/patients/:id" element={<PatientProfile />} />
        <Route path="/patients/:patientId/symptoms" element={<PatientSymptoms />} />
      </Routes>
    </Router>
  );
}

export default App;
