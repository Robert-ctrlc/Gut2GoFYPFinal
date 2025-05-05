const express = require('express')
const router = express.Router()
const admin = require('firebase-admin')

router.post('/', async (req, res) => {
  const { patientId, mealPlan } = req.body
  try {
    await admin
      .firestore()
      .collection('mealPlans')
      .add({
        patientId,
        mealPlan,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      })
    res.status(201).json({})
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

module.exports = router
