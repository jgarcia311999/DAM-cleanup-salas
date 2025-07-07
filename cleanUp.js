const admin = require("firebase-admin");

const serviceAccount = {
  type: process.env.TYPE,
  project_id: process.env.PROJECT_ID,
  private_key_id: process.env.PRIVATE_KEY_ID,
  private_key: process.env.PRIVATE_KEY.replace(/\\n/g, '\n'),
  client_email: process.env.CLIENT_EMAIL,
  client_id: process.env.CLIENT_ID,
  auth_uri: process.env.AUTH_URI,
  token_uri: process.env.TOKEN_URI,
  auth_provider_x509_cert_url: process.env.AUTH_PROVIDER,
  client_x509_cert_url: process.env.CLIENT_CERT
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

(async () => {
  const now = Date.now();
  const threshold = now - 10 * 60 * 1000;

  const snapshot = await db.collection("salas").get();

  let count = 0;
  const batch = db.batch();

  snapshot.forEach((doc) => {
    const data = doc.data();
    if (!data.lastUpdated || data.lastUpdated < threshold) {
      batch.delete(doc.ref);
      count++;
    }
  });

  if (count > 0) {
    await batch.commit();
    console.log(`Eliminadas ${count} salas inactivas`);
  } else {
    console.log("No hay salas inactivas para eliminar");
  }

  process.exit();
})();