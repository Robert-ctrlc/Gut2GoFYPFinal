const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

router.get('/', async (req, res) => {
  try {
    const usersSnap = await admin.firestore().collection('users').get();
    const patients = usersSnap.docs.map(d => ({ uid: d.id, name: d.data().name || d.data().email }));
    const patientMap = Object.fromEntries(patients.map(p => [p.uid, p.name]));
    const totalPatients = patients.length;

    const logsSnap = await admin.firestore().collectionGroup('logs').get();
    const allLogs = logsSnap.docs.map(doc => {
      const d = doc.data();
      return {
        patientId: doc.ref.parent.parent.id,
        timestamp: d.timestamp.toDate(),
        pain: d.painLevel || 0,
        stress: d.stressLevel || 0
      };
    });

    const now = new Date();
    const oneDayAgo = new Date(now - 24*60*60*1000);
    const sevenDaysAgo = new Date(now - 7*24*60*60*1000);

    const dailySet = new Set(allLogs.filter(l => l.timestamp >= oneDayAgo).map(l => l.patientId));
    const dailyLoggingRate = totalPatients ? (dailySet.size/totalPatients)*100 : 0;

    const logsLastWeek = allLogs.filter(l => l.timestamp >= sevenDaysAgo);
    const avgLogsPerPatient = totalPatients ? logsLastWeek.length/totalPatients : 0;

    const countsLastWeek = {};
    logsLastWeek.forEach(l => {
      countsLastWeek[l.patientId] = (countsLastWeek[l.patientId]||0)+1;
    });
    const lowEngagement = patients
      .filter(p => (countsLastWeek[p.uid]||0) < 3)
      .map(p => ({ uid: p.uid, name: p.name, logsLastWeek: countsLastWeek[p.uid]||0 }));

    const highRisk = allLogs
      .filter(l => l.timestamp >= oneDayAgo && (l.pain >= 8 || l.stress >= 8))
      .map(l => ({
        patientId: l.patientId,
        name: patientMap[l.patientId] || l.patientId,
        date: l.timestamp.toISOString().split('T')[0],
        pain: l.pain,
        stress: l.stress
      }));

    const lastLog = {};
    allLogs.forEach(l => {
      if (!lastLog[l.patientId] || l.timestamp > lastLog[l.patientId]) {
        lastLog[l.patientId] = l.timestamp;
      }
    });
    const overdue = patients
      .filter(p => !lastLog[p.uid] || lastLog[p.uid] < sevenDaysAgo)
      .map(p => ({
        patientId: p.uid,
        name: p.name,
        lastLog: lastLog[p.uid] ? lastLog[p.uid].toISOString().split('T')[0] : null
      }));

    res.json({ totalPatients, dailyLoggingRate, avgLogsPerPatient, lowEngagement, highRisk, overdue });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
