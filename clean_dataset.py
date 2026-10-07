import pandas as pd
import numpy as np
import json

def clean_and_process_dataset(file_path):
    print("Loading dataset...")
    df = pd.read_csv(file_path)

    # 1. Handle Missing Values
    df['Crime_Severity'] = df['Crime_Severity'].fillna(df['Crime_Severity'].median())
    df['Ride_Fare_INR'] = df['Ride_Fare_INR'].fillna(df['Ride_Fare_INR'].median())
    df['Weather_Temperature_C'] = df['Weather_Temperature_C'].fillna(df['Weather_Temperature_C'].median())

    # 2. Time-of-day Weight Factor
    time_weights = {
        'Morning': 1.0,
        'Afternoon': 1.1,
        'Evening': 1.3,
        'Night': 1.6
    }
    df['Time_Weight'] = df['Time_of_Day'].map(time_weights).fillna(1.0)

    # 3. Calculate Incident Risk Score
    # Risk increases with severity & complaints; decreases with CCTV & police presence
    df['Raw_Risk_Score'] = (
        (df['Crime_Severity'] * 0.4) +
        (df['Public_Complaints'] * 0.2) +
        ((10 - df['Nearby_CCTV_Cameras'].clip(0, 10)) * 0.2) +
        ((5 - df['Num_Police_Stations_Nearby'].clip(0, 5)) * 0.2)
    ) * df['Time_Weight']

    # Normalize to 1.0 (Safe) to 5.0 (High Risk) scale
    min_score = df['Raw_Risk_Score'].min()
    max_score = df['Raw_Risk_Score'].max()
    df['Calculated_Risk_Score'] = (1 + 4 * (df['Raw_Risk_Score'] - min_score) / (max_score - min_score)).round(2)

    # Save cleaned CSV
    cleaned_csv_path = 'cleaned_ride_safety_dataset.csv'
    df.to_csv(cleaned_csv_path, index=False)
    print(f"Cleaned dataset saved to: {cleaned_csv_path}")

    # 4. Generate Safety Zones JSON for Firebase Firestore
    zones = df.groupby(['City', 'Location', 'Time_of_Day']).agg(
        avg_risk_score=('Calculated_Risk_Score', 'mean'),
        total_incidents=('Crime_ID', 'count'),
        avg_severity=('Crime_Severity', 'mean'),
        center_lat=('Latitude', 'mean'),
        center_lng=('Longitude', 'mean'),
        avg_cctv=('Nearby_CCTV_Cameras', 'mean'),
        avg_police_stations=('Num_Police_Stations_Nearby', 'mean')
    ).reset_index()

    zones['avg_risk_score'] = zones['avg_risk_score'].round(2)
    
    # Assign Risk Category Label
    def categorize_risk(score):
        if score < 2.2:
            return 'Low Risk'
        elif score < 3.5:
            return 'Moderate Risk'
        else:
            return 'High Risk'

    zones['risk_category'] = zones['avg_risk_score'].apply(categorize_risk)

    json_payload = zones.to_dict(orient='records')
    json_path = 'firebase_safety_zones.json'
    with open(json_path, 'w') as f:
        json.dump(json_payload, f, indent=4)
        
    print(f"Firebase JSON saved to: {json_path}")
    print(f"Processed {len(zones)} unique urban safety zones across Mumbai & Delhi.")

if __name__ == "__main__":
    clean_and_process_dataset('ride_safety_dataset.csv')
    