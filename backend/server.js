const http = require('http');
const url = require('url');
const admin = require('firebase-admin');
const serviceAccount = require('./secrets/gut2gofypfinal-945d770b0216.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const usersCollection = db.collection('users');

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const method = req.method;

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  if (method === 'GET' && parsedUrl.pathname === '/patients') {
    try {
      const snapshot = await usersCollection.get();
      const patients = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(patients));
    } catch (error) {
      res.writeHead(500);
      res.end('Error fetching patients.');
    }
  }

  if (method === 'GET' && parsedUrl.pathname.match(/^\/patients\/([^/]+)\/symptoms$/)) {
    const patientId = parsedUrl.pathname.split('/')[2];
  
    try {
      const symptomsSnapshot = await db.collection('users').doc(patientId).collection('symptoms').get();
      const symptoms = symptomsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(symptoms));
    } catch (error) {
      console.error('Error fetching symptoms:', error);
      res.writeHead(500);
      res.end('Error fetching symptoms.');
    }
  }

  if (method === 'POST' && parsedUrl.pathname === '/patients') {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const { name, email, password } = JSON.parse(body);

        if (!name || !email || !password) {
          res.writeHead(400);
          return res.end('Missing required fields.');
        }

        const userRecord = await admin.auth().createUser({
          email,
          password,
          displayName: name,
        });

        const newPatient = {
          name,
          email,
          uid: userRecord.uid,
        };

        await usersCollection.doc(userRecord.uid).set(newPatient);

        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Patient added successfully!', patient: newPatient }));
      } catch (error) {
        res.writeHead(500);
        res.end('Error adding patient.');
      }
    });
  } else if (method !== 'GET' && method !== 'POST') {
    res.writeHead(405);
    res.end('Method Not Allowed');
  }
});

const PORT = 5002;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

