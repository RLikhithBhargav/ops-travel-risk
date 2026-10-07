import type { AirportRef } from "@/lib/types";
import meta from "@/data/us-airports-meta.json";
import p00 from "@/data/parts/us-airports-p00.json";
import p01 from "@/data/parts/us-airports-p01.json";
import p02 from "@/data/parts/us-airports-p02.json";
import p03 from "@/data/parts/us-airports-p03.json";
import p04 from "@/data/parts/us-airports-p04.json";
import p05 from "@/data/parts/us-airports-p05.json";
import p06 from "@/data/parts/us-airports-p06.json";
import p07 from "@/data/parts/us-airports-p07.json";
import p08 from "@/data/parts/us-airports-p08.json";
import p09 from "@/data/parts/us-airports-p09.json";
import p10 from "@/data/parts/us-airports-p10.json";

export type DatasetAirport = {
  iata: string;
  icao: string;
  name: string;
  city: string;
  region: string;
  lat: number;
  lon: number;
  type: "L" | "M" | "S" | string;
  sched: boolean;
};

const DATASET = {
  source: (meta as { source: string }).source,
  rule: (meta as { rule: string }).rule,
  count: (meta as { count: number }).count,
  airports: [...p00, ...p01, ...p02, ...p03, ...p04, ...p05, ...p06, ...p07, ...p08, ...p09, ...p10] as DatasetAirport[],
};

/** Public commercial-ish US airports from OurAirports filter. */
export const AIRPORTS: AirportRef[] = DATASET.airports.map((a) => ({
  iata: a.iata,
  icao: a.icao,
  name: a.name,
  city: a.city,
  lat: a.lat,
  lon: a.lon,
}));

const DATA_BY_IATA = new Map(DATASET.airports.map((a) => [a.iata, a]));

export const AIRPORT_DATA_META = {
  source: DATASET.source,
  rule: DATASET.rule,
  count: DATASET.count,
};

function rankOf(a: DatasetAirport): number {
  const typeRank = a.type === "L" ? 3 : a.type === "M" ? 2 : 1;
  return typeRank + (a.sched ? 2 : 0);
}

function haversineKm(
  a: { lat: number; lon: number },
  b: { lat: number; lon: number },
): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

const ALIASES: Record<string, string> = {
  nyc: "new york",
  "n.y.c.": "new york",
  "new york city": "new york",
  "new york, ny": "new york",
  sf: "san francisco",
  "sfo": "san francisco",
  la: "los angeles",
  "l.a.": "los angeles",
  "los angeles, ca": "los angeles",
  "chi-town": "chicago",
  "chicago, il": "chicago",
  dc: "washington",
  "d.c.": "washington",
  "wash dc": "washington",
  "washington, dc": "washington",
  "washington d.c.": "washington",
  philly: "philadelphia",
  vegas: "las vegas",
  nola: "new orleans",
  beantown: "boston",
  motown: "detroit",
};

function normalizeCityQuery(input: string): {
  city: string;
  region?: string;
} {
  let trimmed = input.trim().toLowerCase().replace(/\s+/g, " ");
  let region: string | undefined;
  const stateMatch = trimmed.match(
    /^(.*?),\s*([a-z]{2})\.?$/,
  );
  if (stateMatch) {
    trimmed = stateMatch[1].trim();
    region = stateMatch[2].toUpperCase();
  }
  const alias = ALIASES[trimmed] ?? ALIASES[input.trim().toLowerCase()];
  return { city: (alias ?? trimmed).trim(), region };
}

function toAirportRef(a: DatasetAirport): AirportRef {
  return {
    iata: a.iata,
    icao: a.icao,
    name: a.name,
    city: a.city,
    lat: a.lat,
    lon: a.lon,
  };
}

/** Best airport for an exact city (+ optional state). */
function bestInCity(cityLower: string, region?: string): DatasetAirport | null {
  const matches = DATASET.airports.filter((a) => {
    if (a.city.toLowerCase() !== cityLower) return false;
    if (region && a.region.toUpperCase() !== region) return false;
    return true;
  });
  if (!matches.length) return null;
  return matches.sort((a, b) => rankOf(b) - rankOf(a))[0];
}

function nearestAirport(
  lat: number,
  lon: number,
): DatasetAirport | null {
  let best: DatasetAirport | null = null;
  let bestD = Infinity;
  for (const a of DATASET.airports) {
    const d = haversineKm({ lat, lon }, a) - rankOf(a) * 5;
    if (d < bestD) {
      bestD = d;
      best = a;
    }
  }
  return best;
}

export interface AirportSuggestion {
  label: string;
  city: string;
  iata: string;
  icao: string;
  name: string;
  region: string;
  value: string;
}

function toSuggestion(a: DatasetAirport): AirportSuggestion {
  const value = a.region ? `${a.city}, ${a.region}` : a.city;
  return {
    label: `${a.city}, ${a.region} → ${a.iata}`,
    city: a.city,
    iata: a.iata,
    icao: a.icao,
    name: a.name,
    region: a.region,
    value,
  };
}

export function searchAirportSuggestions(
  query: string,
  limit = 8,
): AirportSuggestion[] {
  const raw = query.trim();
  if (!raw) {
    const starters = [
      "New York, NY",
      "Chicago, IL",
      "Los Angeles, CA",
      "San Francisco, CA",
      "Dallas, TX",
      "Miami, FL",
      "Denver, CO",
      "Seattle, WA",
    ];
    return starters
      .map((s) => resolveAirport(s))
      .filter((a): a is AirportRef => !!a)
      .map((a) => {
        const full = DATA_BY_IATA.get(a.iata)!;
        return toSuggestion(full);
      })
      .slice(0, limit);
  }

  const { city: qCity, region } = normalizeCityQuery(raw);
  const upper = raw.toUpperCase().replace(/[^A-Z0-9]/g, "");
  const scored: { a: DatasetAirport; score: number }[] = [];

  for (const a of DATASET.airports) {
    const city = a.city.toLowerCase();
    const name = a.name.toLowerCase();
    let score = 0;

    if (a.iata === upper || a.icao === upper) score = 100;
    else if (upper.length >= 2 && a.iata.startsWith(upper)) score = 92;
    else if (city === qCity && (!region || a.region === region)) score = 88;
    else if (city.startsWith(qCity)) score = 72;
    else if (city.includes(qCity)) score = 55;
    else if (name.includes(qCity)) score = 40;
    else continue;

    if (region && a.region === region) score += 8;
    score += rankOf(a);

    scored.push({ a, score });
  }

  const byKey = new Map<string, { a: DatasetAirport; score: number }>();
  for (const row of scored.sort((x, y) => y.score - x.score)) {
    const key = `${row.a.city.toLowerCase()}|${row.a.region}|${row.a.iata}`;
    const cityKey = `${row.a.city.toLowerCase()}|${row.a.region}`;
    const existingCity = [...byKey.values()].find(
      (v) => `${v.a.city.toLowerCase()}|${v.a.region}` === cityKey,
    );
    if (existingCity) continue;
    if (!byKey.has(key)) byKey.set(cityKey, row);
  }

  return [...byKey.values()]
    .sort((x, y) => y.score - x.score)
    .slice(0, limit)
    .map((row) => toSuggestion(row.a));
}

export function resolveAirport(cityInput: string): AirportRef | null {
  const trimmed = cityInput.trim();
  if (!trimmed) return null;

  const upper = trimmed.toUpperCase();
  if (/^[A-Z0-9]{3}$/.test(upper)) {
    const byIata = DATA_BY_IATA.get(upper);
    if (byIata) return toAirportRef(byIata);
  }
  if (/^K?[A-Z0-9]{3,4}$/.test(upper)) {
    const icao = upper.startsWith("K") ? upper : `K${upper}`;
    const byIcao = DATASET.airports.find((a) => a.icao === icao);
    if (byIcao) return toAirportRef(byIcao);
  }

  const { city, region } = normalizeCityQuery(trimmed);
  if (!city) return null;

  const sameCity = bestInCity(city, region);
  if (sameCity) return toAirportRef(sameCity);

  const partial = DATASET.airports
    .filter((a) => a.city.toLowerCase().startsWith(city))
    .sort((a, b) => rankOf(b) - rankOf(a));
  if (partial[0]) return toAirportRef(partial[0]);

  const includes = DATASET.airports
    .filter((a) => a.city.toLowerCase().includes(city))
    .sort((a, b) => rankOf(b) - rankOf(a));
  if (includes[0]) return toAirportRef(includes[0]);

  return null;
}

export function nearestCommercialAirport(
  lat: number,
  lon: number,
): AirportRef | null {
  const a = nearestAirport(lat, lon);
  return a ? toAirportRef(a) : null;
}

export async function resolveAirportWithFallback(
  cityInput: string,
): Promise<AirportRef | null> {
  const direct = resolveAirport(cityInput);
  if (direct) return direct;

  const q = cityInput.trim();
  if (!q) return null;

  try {
    const params = new URLSearchParams({
      name: q,
      count: "5",
      language: "en",
      format: "json",
    });
    const res = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?${params}`,
      { headers: { Accept: "application/json" }, next: { revalidate: 86400 } },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as {
      results?: Array<{
        name: string;
        latitude: number;
        longitude: number;
        country_code?: string;
        admin1?: string;
      }>;
    };
    const us = (data.results ?? []).find(
      (r) => (r.country_code || "").toUpperCase() === "US",
    );
    if (!us) return null;
    return nearestCommercialAirport(us.latitude, us.longitude);
  } catch {
    return null;
  }
}
