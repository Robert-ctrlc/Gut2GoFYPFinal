const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');


router.get('/:uid', async (req, res) => {
  try {
    const patientId = req.params.uid;  
    let logs = [];

   
    const symptomsSnapshot = await admin.firestore()
      .collection('symptoms') 
      .doc(patientId)          
      .collection('logs')     
      .get();

    if (symptomsSnapshot.empty) {
      return res.status(404).send('No symptoms found for this patient.');
    }

    symptomsSnapshot.forEach(doc => {
      const logData = doc.data();
      if (logData.timestamp && logData.timestamp.toDate) {
        logData.timestamp = logData.timestamp.toDate();  
      }
      logs.push(logData);  
    });

    res.status(200).json(logs);  
  } catch (error) {
    console.error('Error fetching symptoms for patient:', error);
    res.status(500).send('Error fetching symptoms.');
  }
});

module.exports = router;
