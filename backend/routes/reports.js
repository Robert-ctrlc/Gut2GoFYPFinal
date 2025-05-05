const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

router.get('/', async (req, res) => {
  try {
    const patientId = req.query.patientId;
    let snapshot;
    if (patientId) {
      snapshot = await admin
        .firestore()
        .collection('symptoms')
        .doc(patientId)
        .collection('logs')
        .get();
    } else {
      snapshot = await admin
        .firestore()
        .collectionGroup('logs')
        .get();
    }
    const allLogs = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        date: data.timestamp.toDate(),
      };
    });
    const grouped = {};
    allLogs.forEach(log => {
      const day = log.date.toISOString().split('T')[0];
      if (!grouped[day]) grouped[day] = [];
      grouped[day].push(log);
    });
    const timeSeries = Object.keys(grouped).sort().map(day => {
      const logs = grouped[day];
      const avgPain = logs.reduce((sum, log) => sum + (log.painLevel || 0), 0) / logs.length;
      const avgStress = logs.reduce((sum, log) => sum + (log.stressLevel || 0), 0) / logs.length;
      const diarrheaCount = logs.filter(log => log.bowelMovements === 'Diarrhea').length;
      const constipationCount = logs.filter(log => log.bowelMovements === 'Constipation').length;
      return {
        date: day,
        avgPain,
        avgStress,
        diarrheaCount,
        constipationCount,
        logsCount: logs.length,
      };
    });
    const logsCount = allLogs.length;
    const totalPain = allLogs.reduce((sum, log) => sum + (log.painLevel || 0), 0);
    const totalStress = allLogs.reduce((sum, log) => sum + (log.stressLevel || 0), 0);
    const bowelCounts = {
      diarrhea: allLogs.filter(log => log.bowelMovements === 'Diarrhea').length,
      constipation: allLogs.filter(log => log.bowelMovements === 'Constipation').length,
    };
    const totalNormal = logsCount - bowelCounts.diarrhea - bowelCounts.constipation;
    const bowelDistribution = {
      diarrhea: bowelCounts.diarrhea,
      constipation: bowelCounts.constipation,
      normal: totalNormal,
    };
    const mostCommonBowel = Object.entries(bowelDistribution).sort((a, b) => b[1] - a[1])[0][0];
    const summary = {
      avgPain: logsCount ? totalPain / logsCount : 0,
      avgStress: logsCount ? totalStress / logsCount : 0,
      logsCount,
      mostCommonBowel,
      bowelDistribution,
      painStressPairs: allLogs.map(log => ({
        x: log.painLevel || 0,
        y: log.stressLevel || 0,
      })),
    };
    res.json({ timeSeries, summary });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
