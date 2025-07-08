const admin = require("firebase-admin");

// Leer y parsear el JSON completo desde la variable FIREBASE_CONFIG_JSON
const serviceAccount = JSON.parse(process.env.FIREBASE_CONFIG_JSON);

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
    const ultima = data.timestamp;

    if (!ultima || ahora - ultima > expiracion) {
      await db.collection('salas').doc(doc.id).delete();
      console.log(`✅ Sala eliminada: ${doc.id}`);
      eliminadas++;
    }
  }

  console.log(`🧹 Limpieza completada. Salas eliminadas: ${eliminadas}`);
})();