"""
GeoSafe: Firebase Firestore Seed Script
Populates the 'safety_zones' collection from 'firebase_safety_zones.json'
"""

import json
import os
import sys

def seed_firestore(service_account_path='serviceAccountKey.json'):
    try:
        import firebase_admin
        from firebase_admin import credentials, firestore
    except ImportError:
        print("[!] firebase-admin is not installed. Run: pip install firebase-admin")
        sys.exit(1)

    if not os.path.exists(service_account_path):
        print(f"[!] Service account key not found at '{service_account_path}'.")
        print("[*] Please download your serviceAccountKey.json from Firebase Console -> Project Settings -> Service Accounts.")
        print("[*] Place it in the root directory and run this script again.")
        sys.exit(1)

    # Initialize Firebase Admin SDK
    cred = credentials.Certificate(service_account_path)
    firebase_admin.initialize_app(cred)
    db = firestore.client()

    json_path = 'firebase_safety_zones.json'
    if not os.path.exists(json_path):
        json_path = os.path.join(os.path.dirname(__file__), 'firebase_safety_zones.json')

    print(f"[*] Reading safety zones dataset from {json_path}...")
    with open(json_path, 'r', encoding='utf-8') as f:
        zones = json.load(f)

    print(f"[*] Found {len(zones)} urban safety zones across Mumbai & Delhi.")
    print("[*] Commencing batch upload to Firestore collection: 'safety_zones'...")

    batch = db.batch()
    batch_count = 0
    total_uploaded = 0

    for zone in zones:
        # Document ID: e.g. "Mumbai_Andheri_Night"
        doc_id = f"{zone['City']}_{zone['Location']}_{zone['Time_of_Day']}".replace(" ", "_")
        doc_ref = db.collection('safety_zones').document(doc_id)

        payload = {
            'City': str(zone.get('City')),
            'Location': str(zone.get('Location')),
            'Time_of_Day': str(zone.get('Time_of_Day')),
            'avg_risk_score': float(zone.get('avg_risk_score', 1.0)),
            'risk_category': str(zone.get('risk_category', 'Low Risk')),
            'center_lat': float(zone.get('center_lat', 0.0)),
            'center_lng': float(zone.get('center_lng', 0.0)),
            'avg_cctv': float(zone.get('avg_cctv', 0.0)),
            'avg_police_stations': float(zone.get('avg_police_stations', 0.0)),
            'total_incidents': int(zone.get('total_incidents', 0)),
            'avg_severity': float(zone.get('avg_severity', 0.0))
        }

        batch.set(doc_ref, payload, merge=True)
        batch_count += 1
        total_uploaded += 1

        if batch_count >= 400:  # Firestore limit is 500 per batch
            batch.commit()
            print(f"    [+] Committed batch of {batch_count} documents...")
            batch = db.batch()
            batch_count = 0

    if batch_count > 0:
        batch.commit()
        print(f"    [+] Committed final batch of {batch_count} documents.")

    print(f"\n[SUCCESS] Successfully seeded {total_uploaded} safety zones into Firestore!")

if __name__ == '__main__':
    key_path = sys.argv[1] if len(sys.argv) > 1 else 'serviceAccountKey.json'
    seed_firestore(key_path)
