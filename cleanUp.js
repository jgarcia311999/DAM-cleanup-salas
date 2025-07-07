// cleanUp.js
const admin = require("firebase-admin");

admin.initializeApp({
  credential: admin.credential.cert({
    type: process.env.TYPE,
    project_id: process.env.PROJECT_ID,
    private_key_id: process.env.PRIVATE_KEY_ID,
    private_key: process.env.PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.CLIENT_EMAIL,
    client_id: process.env.CLIENT_ID,
    auth_uri: process.env.AUTH_URI,
    token_uri: process.env.TOKEN_URI,
    auth_provider_x509_cert_url: process.env.AUTH_PROVIDER,
    client_x509_cert_url: process.env.CLIENT_CERT,
  }),
});

const db = admin.firestore();

(async () => {
  const ahora = Date.now();
  const expiracion = 1000 * 60 * 30; // 30 minutos

  const snapshot = await db.collection('salas').get();

  let eliminadas = 0;

  for (const doc of snapshot.docs) {
    const data = doc.data();
    const ultima = data.timestamp;

    if (!ultima || ahora - ultima > expiracion) {
      await db.collection('salas').doc(doc.id).delete();
      console.log(`✅ Sala eliminada: ${doc.id}`);
      eliminadas++;
    }
  }

  console.log(`🧹 Limpieza completada. Salas eliminadas: ${eliminadas}`);
})();