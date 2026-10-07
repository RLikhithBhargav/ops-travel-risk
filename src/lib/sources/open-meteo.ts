import type { AirportRef, Evidence, SourceResult } from "@/lib/types";

interface DailyForecast {
  time: string[];
  precipitation_sum?: number[];
  precipitation_probability_max?: number[];
  wind_speed_10m_max?: number[];
  wind_gusts_10m_max?: number[];
  weather_code?: number[];
}

const WMO_LABELS: Record<number, string> = {
  0: "Clear",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Depositing rime fog",
  51: "Light drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  71: "Slight snow",
  73: "Moderate snow",
  75: "Heavy snow",
  77: "Snow grains",
  80: "Slight rain showers",
  81: "Moderate rain showers",
  82: "Violent rain showers",
  85: "Slight snow showers",
  86: "Heavy snow showers",
  95: "Thunderstorm",
  96: "Thunderstorm with slight hail",
  99: "Thunderstorm with heavy hail",
};

function weatherLabel(code: number | undefined): string {
  if (code === undefined) return "Unknown";
  return WMO_LABELS[code] ?? `WMO code ${code}`;
}

async function fetchDaily(
  airport: AirportRef,
  date: string,
): Promise<DailyForecast> {
  const params = new URLSearchParams({
    latitude: String(airport.lat),
    longitude: String(airport.lon),
    daily:
      "weather_code,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max",
    timezone: "auto",
    start_date: date,
    end_date: date,
  });

  const url = `https://api.open-meteo.com/v1/forecast?${params}`;
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    next: { revalidate: 600 },
  });

  if (!res.ok) {
    throw new Error(`Open-Meteo HTTP ${res.status}`);
  }

  const data = (await res.json()) as { daily?: DailyForecast };
  if (!data.daily?.time?.length) {
    throw new Error("Open-Meteo returned no daily forecast");
  }
  return data.daily;
}

function evidenceForAirport(
  airport: AirportRef,
  location: "origin" | "destination",
  daily: DailyForecast,
  fetchedAt: string,
): Evidence[] {
  const idx = 0;
  const precip = daily.precipitation_sum?.[idx] ?? 0;
  const precipProb = daily.precipitation_probability_max?.[idx] ?? 0;
  const wind = daily.wind_speed_10m_max?.[idx] ?? 0;
  const gusts = daily.wind_gusts_10m_max?.[idx] ?? 0;
  const code = daily.weather_code?.[idx];
  const label = weatherLabel(code);
  const prefix = location === "origin" ? "ometeo-orig" : "ometeo-dest";
  const place = `${airport.city} (${airport.iata})`;
  const url = `https://open-meteo.com/en/docs#latitude=${airport.lat}&longitude=${airport.lon}`;

  const items: Evidence[] = [
    {
      id: `${prefix}-summary`,
      source: "open-meteo",
      title: `${place} forecast summary`,
      summary: `${label}. Max precip probability ${precipProb}%, precip sum ${precip.toFixed(1)} mm, max wind ${wind.toFixed(0)} km/h, gusts ${gusts.toFixed(0)} km/h.`,
      url,
      fetchedAt,
      observedAt: daily.time[idx],
      location,
      rawHint: `wmo=${code}; precip=${precip}; prob=${precipProb}; wind=${wind}; gust=${gusts}`,
    },
  ];

  if (wind >= 40 || gusts >= 60) {
    items.push({
      id: `${prefix}-wind`,
      source: "open-meteo",
      title: `${place} elevated winds`,
      summary: `Forecast peak wind ${wind.toFixed(0)} km/h with gusts to ${gusts.toFixed(0)} km/h — operationally relevant for ground stops and go-around risk.`,
      url,
      fetchedAt,
      observedAt: daily.time[idx],
      location,
      rawHint: `wind=${wind}; gust=${gusts}`,
    });
  }

  if (precipProb >= 60 || precip >= 10 || (code !== undefined && code >= 95)) {
    items.push({
      id: `${prefix}-precip`,
      source: "open-meteo",
      title: `${place} precipitation / convective risk`,
      summary: `${label} with ${precipProb}% max precip probability and ${precip.toFixed(1)} mm expected. Convective or heavy precip can cascade into arrival delays.`,
      url,
      fetchedAt,
      observedAt: daily.time[idx],
      location,
      rawHint: `code=${code}; precip=${precip}; prob=${precipProb}`,
    });
  }

  if (code !== undefined && (code === 45 || code === 48)) {
    items.push({
      id: `${prefix}-fog`,
      source: "open-meteo",
      title: `${place} fog signal`,
      summary: `Forecast indicates fog (${label}), which often reduces arrival rates at busy hubs.`,
      url,
      fetchedAt,
      observedAt: daily.time[idx],
      location,
      rawHint: `code=${code}`,
    });
  }

  if (code !== undefined && code >= 71 && code <= 86) {
    items.push({
      id: `${prefix}-snow`,
      source: "open-meteo",
      title: `${place} winter precip`,
      summary: `${label} expected — snow/ice operations slow de-icing and runway throughput.`,
      url,
      fetchedAt,
      observedAt: daily.time[idx],
      location,
      rawHint: `code=${code}`,
    });
  }

  return items;
}

export async function fetchOpenMeteoEvidence(
  origin: AirportRef,
  destination: AirportRef,
  date: string,
): Promise<SourceResult> {
  const fetchedAt = new Date().toISOString();
  try {
    const [origDaily, destDaily] = await Promise.all([
      fetchDaily(origin, date),
      fetchDaily(destination, date),
    ]);

    return {
      evidence: [
        ...evidenceForAirport(origin, "origin", origDaily, fetchedAt),
        ...evidenceForAirport(destination, "destination", destDaily, fetchedAt),
      ],
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Open-Meteo failed";
    return { evidence: [], error: message };
  }
}
