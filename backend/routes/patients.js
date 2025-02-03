const express = require("express");
const { db } = require("../config/firebase");

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const patientsSnapshot = await db.collection("users").get();
        const patients = patientsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).json(patients);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch patients.", details: error.message });
    }
});


router.get("/:id", async (req, res) => {
    try {
        const patientDoc = await db.collection("users").doc(req.params.id).get();
        if (!patientDoc.exists) {
            return res.status(404).json({ error: "Patient not found." });
        }
        res.status(200).json({ id: patientDoc.id, ...patientDoc.data() });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch patient.", details: error.message });
    }
});

module.exports = router;
