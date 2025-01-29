const admin = require("firebase-admin");
const serviceAccount = require("./gut2gofypfinal-firebase-adminsdk-85nda-1233c27b90.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://console.firebase.google.com/project/gut2gofypfinal/firestore/databases/-default-/data",
});

const db = admin.firestore();
module.exports = { db };