const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

router.post('/', async (req, res) => {
  const { patientId, medicationPlan } = req.body;
  try {
    await admin.firestore().collection('medicationPlans').add({
      patientId,
      medicationPlan,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    res.status(201).json({});
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/:patientId', async (req, res) => {
  try {
    const uid = req.params.patientId;
    const snap = await admin.firestore()
      .collection('medicationPlans')
      .where('patientId', '==', uid)
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get();
    if (snap.empty) return res.json({});
    const data = snap.docs[0].data();
    res.json({ medicationPlan: data.medicationPlan });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
