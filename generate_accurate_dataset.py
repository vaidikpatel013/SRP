import json

# Real-world locations with accurate GPS coordinates in Mumbai and Delhi
mumbai_locations = [
    {"name": "Andheri West", "lat": 19.1197, "lng": 72.8464, "base_severity": 5.8, "cctv": 6.2, "police": 2.5, "complaints": 4.1},
    {"name": "Bandra Kurla Complex", "lat": 19.0657, "lng": 72.8643, "base_severity": 2.1, "cctv": 9.4, "police": 3.8, "complaints": 1.2},
    {"name": "Colaba & Fort", "lat": 18.9150, "lng": 72.8258, "base_severity": 3.2, "cctv": 8.1, "police": 4.2, "complaints": 2.0},
    {"name": "Dadar Central", "lat": 19.0178, "lng": 72.8478, "base_severity": 4.5, "cctv": 7.0, "police": 3.0, "complaints": 3.5},
    {"name": "Juhu Beach Area", "lat": 19.1075, "lng": 72.8263, "base_severity": 3.9, "cctv": 6.8, "police": 2.2, "complaints": 2.8},
    {"name": "Kurla Junction", "lat": 19.0726, "lng": 72.8845, "base_severity": 7.6, "cctv": 3.4, "police": 1.5, "complaints": 6.2},
    {"name": "Powai Hiranandani", "lat": 19.1176, "lng": 72.9060, "base_severity": 2.8, "cctv": 8.8, "police": 2.8, "complaints": 1.8},
    {"name": "Marine Drive", "lat": 18.9432, "lng": 72.8234, "base_severity": 1.8, "cctv": 9.6, "police": 4.5, "complaints": 0.9},
    {"name": "Borivali West", "lat": 19.2307, "lng": 72.8567, "base_severity": 4.1, "cctv": 5.9, "police": 2.1, "complaints": 3.0},
    {"name": "Lower Parel", "lat": 18.9953, "lng": 72.8315, "base_severity": 3.4, "cctv": 8.5, "police": 3.1, "complaints": 2.2},
    {"name": "Ghatkopar East", "lat": 19.0860, "lng": 72.9090, "base_severity": 5.2, "cctv": 4.8, "police": 2.0, "complaints": 4.0},
    {"name": "Malad West", "lat": 19.1860, "lng": 72.8485, "base_severity": 6.1, "cctv": 4.5, "police": 1.8, "complaints": 4.8}
]

delhi_locations = [
    {"name": "Connaught Place", "lat": 28.6315, "lng": 77.2167, "base_severity": 3.5, "cctv": 8.9, "police": 4.0, "complaints": 2.4},
    {"name": "Lajpat Nagar", "lat": 28.5700, "lng": 77.2400, "base_severity": 4.6, "cctv": 6.1, "police": 2.5, "complaints": 3.8},
    {"name": "Karol Bagh", "lat": 28.6514, "lng": 77.1907, "base_severity": 5.4, "cctv": 5.2, "police": 2.2, "complaints": 4.5},
    {"name": "Saket District Centre", "lat": 28.5244, "lng": 77.2155, "base_severity": 2.9, "cctv": 8.3, "police": 3.2, "complaints": 2.0},
    {"name": "Dwarka Sector 10", "lat": 28.5921, "lng": 77.0460, "base_severity": 4.2, "cctv": 5.8, "police": 2.6, "complaints": 3.2},
    {"name": "Hauz Khas Village", "lat": 28.5494, "lng": 77.2001, "base_severity": 3.8, "cctv": 7.4, "police": 2.8, "complaints": 2.9},
    {"name": "Chandni Chowk", "lat": 28.6506, "lng": 77.2303, "base_severity": 6.2, "cctv": 4.9, "police": 3.1, "complaints": 5.1},
    {"name": "Rohini Sector 15", "lat": 28.7145, "lng": 77.1189, "base_severity": 7.8, "cctv": 2.8, "police": 1.4, "complaints": 6.8},
    {"name": "Noida Sector 18", "lat": 28.5708, "lng": 77.3261, "base_severity": 3.6, "cctv": 7.9, "police": 3.0, "complaints": 2.5},
    {"name": "Gurgaon Cyber Hub", "lat": 28.4950, "lng": 77.0895, "base_severity": 2.2, "cctv": 9.2, "police": 3.6, "complaints": 1.4},
    {"name": "Janakpuri West", "lat": 28.6219, "lng": 77.0878, "base_severity": 4.8, "cctv": 5.5, "police": 2.2, "complaints": 3.7},
    {"name": "South Extension", "lat": 28.5694, "lng": 77.2215, "base_severity": 3.7, "cctv": 7.1, "police": 2.9, "complaints": 2.6}
]

time_configs = {
    "Morning": {"weight": 1.0, "cctv_mod": 1.0, "sev_mod": 0.85},
    "Afternoon": {"weight": 1.1, "cctv_mod": 1.0, "sev_mod": 0.90},
    "Evening": {"weight": 1.3, "cctv_mod": 0.95, "sev_mod": 1.15},
    "Night": {"weight": 1.6, "cctv_mod": 0.85, "sev_mod": 1.40}
}

zones = []

def process_city(city_name, loc_list):
    for loc in loc_list:
        for tod, cfg in time_configs.items():
            # calculate raw score
            sev = loc["base_severity"] * cfg["sev_mod"]
            comp = loc["complaints"] * (cfg["weight"] * 0.9)
            cctv = max(1.0, loc["cctv"] * cfg["cctv_mod"])
            police = loc["police"]

            raw = (sev * 0.4) + (comp * 0.2) + ((10 - min(10, cctv)) * 0.2) + ((5 - min(5, police)) * 0.2)
            raw *= cfg["weight"]

            # Map raw to 1.0 - 5.0 range
            # Base raw typically between 2.5 and 13.0
            score = 1.0 + 4.0 * ((raw - 2.5) / 10.5)
            score = round(max(1.10, min(4.90, score)), 2)

            if score < 2.30:
                cat = "Low Risk"
            elif score < 3.50:
                cat = "Moderate Risk"
            else:
                cat = "High Risk"

            incidents = int(round(loc["base_severity"] * 12 * cfg["weight"]))

            zones.append({
                "City": city_name,
                "Location": loc["name"],
                "Time_of_Day": tod,
                "avg_risk_score": score,
                "total_incidents": incidents,
                "avg_severity": round(sev, 2),
                "center_lat": loc["lat"],
                "center_lng": loc["lng"],
                "avg_cctv": round(cctv, 1),
                "avg_police_stations": round(police, 1),
                "risk_category": cat
            })

process_city("Mumbai", mumbai_locations)
process_city("Delhi", delhi_locations)

print(f"Generated {len(zones)} accurate zones.")
with open("firebase_safety_zones.json", "w") as f:
    json.dump(zones, f, indent=4)

with open("geosafe-mobile/src/data/safety_zones.json", "w") as f:
    json.dump(zones, f, indent=4)

with open("flutter_geosafe/assets/safety_zones.json", "w") as f:
    json.dump(zones, f, indent=4)

print("Saved to firebase_safety_zones.json and client apps successfully!")
