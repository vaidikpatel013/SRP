export interface UserProfile {
  uid: string;
  name: string;
  phone: string;
  emergency_contact: string;
  created_at: string | number;
}

export type RiskCategory = 'Low Risk' | 'Moderate Risk' | 'High Risk';
export type TimeOfDay = 'Morning' | 'Afternoon' | 'Evening' | 'Night';

export interface SafetyZone {
  id?: string;
  City: string;
  Location: string;
  Time_of_Day: TimeOfDay | string;
  avg_risk_score: number;
  risk_category: RiskCategory;
  center_lat: number;
  center_lng: number;
  avg_cctv: number;
  avg_police_stations: number;
  total_incidents?: number;
  avg_severity?: number;
}

export interface ActiveEmergency {
  emergency_id: string;
  user_id: string;
  user_name?: string;
  user_phone?: string;
  emergency_contact?: string;
  status: 'ACTIVE' | 'RESOLVED';
  current_lat: number;
  current_lng: number;
  last_updated: number | string | any;
  history?: Array<{ lat: number; lng: number; timestamp: number }>;
}

export interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: number;
}

export interface FakeCallSettings {
  callerName: string;
  callerNumber: string;
  delaySeconds: number;
}
