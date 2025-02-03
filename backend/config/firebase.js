const admin = require("firebase-admin");
const path = require("path");
const serviceAccount = require(path.join(__dirname, "../secrets/gut2gofypfinal-945d770b0216.json"));


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://console.firebase.google.com/project/gut2gofypfinal/firestore/databases/-default-/data",
});

const db = admin.firestore();
module.exports = { db };