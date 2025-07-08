const admin = require("firebase-admin");

// Decodifica el secreto base64 y parsea el JSON
const decoded = Buffer.from(process.env.FIREBASE_CONFIG_JSON_BASE64, 'base64').toString('utf8');
const serviceAccount = JSON.parse(decoded);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

(async () => {
  const ahora = Date.now();
  const expiracion = 1000 * 60 * 30; // 30 minutos

  const snapshot = await db.collection('salas').get();

  let eliminadas = 0;

  for (const doc of snapshot.docs) {
    const data = doc.data();
    const ultima = data.timestamp?.toMillis?.() ?? data.timestamp;

    if (!ultima || ahora - ultima > expiracion) {
      await db.collection('salas').doc(doc.id).delete();
      console.log(`✅ Sala eliminada: ${doc.id}`);
      eliminadas++;
    }
  }

  console.log(`🧹 Limpieza completada. Salas eliminadas: ${eliminadas}`);
})();