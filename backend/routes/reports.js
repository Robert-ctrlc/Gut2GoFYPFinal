const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

router.get('/', async (req, res) => {
  try {
    const patientId = req.query.patientId;  // Get the patientId (Firebase UID)
    let logs = [];

    let snapshot;

    if (patientId) {
      snapshot = await admin.firestore()
        .collection('symptoms')  // Root-level symptoms collection
        .doc(patientId)  // Patient's UID as document ID
        .collection('logs')  // Query the logs sub-collection for the patient
        .get();
    } else {
      snapshot = await admin.firestore().collectionGroup('logs').get(); // Query logs across all users
    }

    snapshot.forEach(doc => {
      const logData = doc.data();
      if (logData.timestamp && logData.timestamp.toDate) {
        logData.timestamp = logData.timestamp.toDate();
      }
      logs.push(logData);
    });

    if (logs.length === 0) {
      console.log('No logs found for this patient.');
    }

    const groupedByDay = {};
    logs.forEach(log => {
      const dayKey = log.timestamp.toISOString().split('T')[0];
      if (!groupedByDay[dayKey]) {
        groupedByDay[dayKey] = [];
      }
      groupedByDay[dayKey].push(log);
    });

    let timeSeries = [];
    for (const [day, dayLogs] of Object.entries(groupedByDay)) {
      const avgPain = dayLogs.reduce((sum, log) => sum + (log.painLevel || 0), 0) / dayLogs.length;
      const avgStress = dayLogs.reduce((sum, log) => sum + (log.stressLevel || 0), 0) / dayLogs.length;
      const diarrheaCount = dayLogs.filter(log => log.bowelMovements === 'Diarrhea').length;
      const constipationCount = dayLogs.filter(log => log.bowelMovements === 'Constipation').length;
      timeSeries.push({
        date: day,
        avgPain,
        avgStress,
        diarrheaCount,
        constipationCount,
        logsCount: dayLogs.length
      });
    }

    timeSeries.sort((a, b) => new Date(a.date) - new Date(b.date));

    let totalPain = 0, totalStress = 0, totalLogs = 0;
    logs.forEach(log => {
      totalPain += (log.painLevel || 0);
      totalStress += (log.stressLevel || 0);
      totalLogs += 1;
    });

    const summary = {
      avgPain: totalLogs > 0 ? (totalPain / totalLogs).toFixed(2) : 0,
      avgStress: totalLogs > 0 ? (totalStress / totalLogs).toFixed(2) : 0,
      logsCount: totalLogs,
      mostCommonBowel: (() => {
        let diarrheaCount = logs.filter(log => log.bowelMovements === 'Diarrhea').length;
        let constipationCount = logs.filter(log => log.bowelMovements === 'Constipation').length;
        if (diarrheaCount > constipationCount) return 'Diarrhea';
        else if (constipationCount > diarrheaCount) return 'Constipation';
        else return 'Equal/Unknown';
      })()
    };

    return res.json({ timeSeries, summary });
  } catch (error) {
    console.error('Error in reports route: ', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
