import { resolveAirport } from "@/lib/airports";
import { cacheKey, getCached, setCached } from "@/lib/cache";
import { fetchAviationWeatherEvidence } from "@/lib/sources/aviationweather";
import { fetchNwsEvidence } from "@/lib/sources/nws";
import { fetchOpenMeteoEvidence } from "@/lib/sources/open-meteo";
import { synthesizeWithLlm } from "@/lib/synthesis/llm";
import type { AssessmentResponse, Evidence } from "@/lib/types";

export class AssessError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

function assertTravelDate(date: string): void {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new AssessError("Date must be YYYY-MM-DD.");
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(`${date}T00:00:00`);
  if (Number.isNaN(target.getTime())) {
    throw new AssessError("Invalid travel date.");
  }
  const diffDays = Math.round(
    (target.getTime() - today.getTime()) / (24 * 60 * 60 * 1000),
  );
  if (diffDays < 0) {
    throw new AssessError("Travel date must be today or a future day.");
  }
  if (diffDays > 7) {
    throw new AssessError(
      "Prototype supports today through the next 7 days only.",
    );
  }
}

export async function runAssessment(input: {
  originCity: string;
  destinationCity: string;
  date: string;
}): Promise<AssessmentResponse> {
  const originCity = input.originCity?.trim();
  const destinationCity = input.destinationCity?.trim();
  const date = input.date?.trim();

  if (!originCity || !destinationCity || !date) {
    throw new AssessError("originCity, destinationCity, and date are required.");
  }

  assertTravelDate(date);

  const origin = resolveAirport(originCity);
  if (!origin) {
    throw new AssessError(
      `Could not resolve origin city "${originCity}" to a known U.S. hub airport.`,
    );
  }
  const destination = resolveAirport(destinationCity);
  if (!destination) {
    throw new AssessError(
      `Could not resolve destination city "${destinationCity}" to a known U.S. hub airport.`,
    );
  }
  if (origin.iata === destination.iata) {
    throw new AssessError("Origin and destination must be different airports.");
  }

  const key = cacheKey(origin.iata, destination.iata, date);
  const cached = getCached(key);
  if (cached) return cached;

  const [meteo, nws, aviation] = await Promise.allSettled([
    fetchOpenMeteoEvidence(origin, destination, date),
    fetchNwsEvidence(origin, destination),
    fetchAviationWeatherEvidence(origin, destination, date),
  ]);

  const evidence: Evidence[] = [];
  const partialFailures: string[] = [];

  const ingest = (
    name: string,
    result: PromiseSettledResult<{ evidence: Evidence[]; error?: string }>,
  ) => {
    if (result.status === "rejected") {
      partialFailures.push(name);
      return;
    }
    if (result.value.error) {
      partialFailures.push(name);
      return;
    }
    evidence.push(...result.value.evidence);
  };

  ingest("Open-Meteo", meteo);
  ingest("NWS", nws);
  ingest("AviationWeather", aviation);

  if (evidence.length === 0) {
    throw new AssessError(
      "All external sources failed. Try again shortly.",
      502,
    );
  }

  const query = {
    originCity,
    destinationCity,
    date,
    originAirport: {
      iata: origin.iata,
      icao: origin.icao,
      name: origin.name,
    },
    destinationAirport: {
      iata: destination.iata,
      icao: destination.icao,
      name: destination.name,
    },
  };

  const assessment = await synthesizeWithLlm({
    query,
    origin,
    destination,
    evidence,
    partialFailures,
  });

  setCached(key, assessment);
  return assessment;
}
