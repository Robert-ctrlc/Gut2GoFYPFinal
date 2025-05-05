const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

router.get('/:patientId', async (req, res) => {
  try {
    const snapshot = await admin.firestore()
      .collection('health')
      .doc(req.params.patientId)
      .collection('logs')
      .orderBy('timestamp', 'desc')
      .limit(1)
      .get();
    if (snapshot.empty) {
      return res.json({});
    }
    const data = snapshot.docs[0].data();
    res.json({
      steps: data.steps || 0,
      sleepHours: data.sleepHours || 0,
      heartRateAvg: data.heartRateAvg || 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
