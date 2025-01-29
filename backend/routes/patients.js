const express = require("express");
const { db } = require("../config/firebase");

const router = express.Router();

// Get all patients
router.get("/", async (req, res) => {
    try {
        const patientsSnapshot = await db.collection("users").get();
        const patients = patientsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).json(patients);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch patients." });
    }
});

// Get symptoms for a specific patient
router.get("/:userId/symptoms", async (req, res) => {
    const { userId } = req.params;
    try {
        const symptomsSnapshot = await db.collection("symptoms").doc(userId).collection("logs").orderBy("timestamp", "desc").get();
        const symptoms = symptomsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).json(symptoms);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch symptoms." });
    }
});

module.exports = router;
