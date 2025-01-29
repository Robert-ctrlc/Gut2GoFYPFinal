require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5002;

const patientsRoutes = require("./routes/patients");
app.use("/patients", patientsRoutes);

app.get("/", (req, res) => {
    res.send("Doctor Dashboard API is running...");
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
