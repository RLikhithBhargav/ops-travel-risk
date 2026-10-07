import type { AirportRef, Evidence, SourceResult } from "@/lib/types";

const USER_AGENT =
  "nuKudoTravelDisruption/1.0 (prototype; contact=travel-assessment@example.com)";

interface NwsAlertFeature {
  id?: string;
  properties?: {
    event?: string;
    headline?: string;
    description?: string;
    severity?: string;
    urgency?: string;
    certainty?: string;
    areaDesc?: string;
    effective?: string;
    expires?: string;
    status?: string;
    messageType?: string;
  };
}

interface NwsAlertsResponse {
  features?: NwsAlertFeature[];
}

const HIGH_SIGNAL = [
  "blizzard",
  "winter storm",
  "ice storm",
  "hurricane",
  "tropical storm",
  "tornado",
  "severe thunderstorm",
  "flash flood",
  "flood warning",
  "high wind",
  "extreme wind",
  "dense fog",
  "freezing fog",
  "airport weather",
  "ashfall",
];

function isRelevant(event: string): boolean {
  const lower = event.toLowerCase();
  return HIGH_SIGNAL.some((k) => lower.includes(k));
}

async function fetchAlertsForPoint(
  airport: AirportRef,
  location: "origin" | "destination",
  fetchedAt: string,
): Promise<Evidence[]> {
  const url = `https://api.weather.gov/alerts/active?point=${airport.lat},${airport.lon}`;
  const res = await fetch(url, {
    headers: {
      Accept: "application/geo+json",
      "User-Agent": USER_AGENT,
    },
    next: { revalidate: 600 },
  });

  if (!res.ok) {
    throw new Error(`NWS HTTP ${res.status} for ${airport.iata}`);
  }

  const data = (await res.json()) as NwsAlertsResponse;
  const features = data.features ?? [];
  const relevant = features.filter((f) => {
    const event = f.properties?.event ?? "";
    return event && isRelevant(event);
  });

  const place = `${airport.city} (${airport.iata})`;
  const prefix = location === "origin" ? "nws-orig" : "nws-dest";

  if (relevant.length === 0) {
    return [
      {
        id: `${prefix}-none`,
        source: "nws",
        title: `No high-signal NWS alerts near ${place}`,
        summary: `Active alert check for lat/lon near ${airport.iata} returned ${features.length} alert(s); none matched high-signal winter/convective/wind/fog criteria.`,
        url: `https://www.weather.gov/`,
        fetchedAt,
        location,
        rawHint: `totalAlerts=${features.length}`,
      },
    ];
  }

  return relevant.slice(0, 6).map((f, i) => {
    const p = f.properties ?? {};
    const event = p.event ?? "Weather alert";
    const headline = p.headline ?? event;
    const severity = p.severity ?? "Unknown";
    const excerpt = (p.description ?? "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 280);

    return {
      id: `${prefix}-${i + 1}`,
      source: "nws" as const,
      title: `${place}: ${event}`,
      summary: `${headline}. Severity ${severity}. Area: ${p.areaDesc ?? "n/a"}.${excerpt ? ` ${excerpt}` : ""}`,
      url: f.id ?? "https://api.weather.gov/alerts/active",
      fetchedAt,
      observedAt: p.effective,
      location,
      rawHint: `${severity}/${p.urgency}/${p.certainty}`,
    };
  });
}

export async function fetchNwsEvidence(
  origin: AirportRef,
  destination: AirportRef,
): Promise<SourceResult> {
  const fetchedAt = new Date().toISOString();
  try {
    const [orig, dest] = await Promise.all([
      fetchAlertsForPoint(origin, "origin", fetchedAt),
      fetchAlertsForPoint(destination, "destination", fetchedAt),
    ]);
    return { evidence: [...orig, ...dest] };
  } catch (err) {
    const message = err instanceof Error ? err.message : "NWS failed";
    return { evidence: [], error: message };
  }
}
