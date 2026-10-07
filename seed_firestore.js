/**
 * GeoSafe: Firebase Firestore Node.js Seed Script
 * Uploads 'firebase_safety_zones.json' into the 'safety_zones' Firestore collection
 */

const fs = require('fs');
const path = require('path');

async function seed() {
  let admin;
  try {
    admin = require('firebase-admin');
  } catch (err) {
    console.error('[!] firebase-admin not found. Run: npm install -g firebase-admin (or in local node_modules)');
    process.exit(1);
  }

  const keyPath = process.argv[2] || path.join(__dirname, 'serviceAccountKey.json');
  if (!fs.existsSync(keyPath)) {
    console.error(`[!] Service account key not found at "${keyPath}".`);
    console.log('[*] Download your serviceAccountKey.json from Firebase Console -> Project Settings -> Service Accounts');
    process.exit(1);
  }

  const serviceAccount = require(path.resolve(keyPath));

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });

  const db = admin.firestore();
  const rawData = fs.readFileSync(path.join(__dirname, 'firebase_safety_zones.json'), 'utf8');
  const zones = JSON.parse(rawData);

  console.log(`[*] Loaded ${zones.length} safety zones from firebase_safety_zones.json`);
  console.log('[*] Commencing upload to collection "safety_zones"...');

  let batch = db.batch();
  let count = 0;
  let total = 0;

  for (const zone of zones) {
    const docId = `${zone.City}_${zone.Location}_${zone.Time_of_Day}`.replace(/\s+/g, '_');
    const docRef = db.collection('safety_zones').document(docId);

    batch.set(docRef, {
      City: zone.City,
      Location: zone.Location,
      Time_of_Day: zone.Time_of_Day,
      avg_risk_score: Number(zone.avg_risk_score),
      risk_category: zone.risk_category,
      center_lat: Number(zone.center_lat),
      center_lng: Number(zone.center_lng),
      avg_cctv: Number(zone.avg_cctv),
      avg_police_stations: Number(zone.avg_police_stations),
      total_incidents: Number(zone.total_incidents || 0),
      avg_severity: Number(zone.avg_severity || 0)
    }, { merge: true });

    count++;
    total++;

    if (count >= 400) {
      await batch.commit();
      console.log(`    [+] Committed ${count} documents...`);
      batch = db.batch();
      count = 0;
    }
  }

  if (count > 0) {
    await batch.commit();
    console.log(`    [+] Committed final ${count} documents.`);
  }

  console.log(`\n[SUCCESS] Seeded ${total} documents into Firestore collection "safety_zones".`);
}

seed().catch(console.error);
