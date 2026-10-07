export type RiskLevel = "low" | "moderate" | "high" | "severe";

export type EvidenceSource =
  | "open-meteo"
  | "nws"
  | "aviationweather"
  | "rules";

export interface AirportRef {
  iata: string;
  icao: string;
  name: string;
  city: string;
  lat: number;
  lon: number;
}

export interface Evidence {
  id: string;
  source: EvidenceSource;
  title: string;
  summary: string;
  url?: string;
  observedAt?: string;
  fetchedAt: string;
  location?: "origin" | "destination" | "route" | "national";
  rawHint?: string;
}

export interface Risk {
  id: string;
  title: string;
  severity: RiskLevel;
  summary: string;
  evidenceIds: string[];
}

export interface Action {
  id: string;
  priority: "now" | "before_travel" | "monitor";
  text: string;
  evidenceIds: string[];
}

export interface AssessmentQuery {
  originCity: string;
  destinationCity: string;
  date: string;
  originAirport: {
    iata: string;
    icao: string;
    name: string;
  };
  destinationAirport: {
    iata: string;
    icao: string;
    name: string;
  };
}

export interface AssessmentResponse {
  query: AssessmentQuery;
  overallRisk: RiskLevel;
  narrative: string;
  confidence: number;
  gaps: string[];
  risks: Risk[];
  actions: Action[];
  evidence: Evidence[];
  synthesisMode: "llm" | "rules";
  partialFailures: string[];
}

export interface AssessRequestBody {
  originCity: string;
  destinationCity: string;
  date: string;
}

export interface SourceResult {
  evidence: Evidence[];
  error?: string;
}
