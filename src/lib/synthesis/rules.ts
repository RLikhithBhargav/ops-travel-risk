import type {
  Action,
  AirportRef,
  AssessmentQuery,
  AssessmentResponse,
  Evidence,
  Risk,
  RiskLevel,
} from "@/lib/types";
import { validateAndSanitizeSynthesis } from "@/lib/synthesis/validate";

const SEVERITY_SCORE: Record<RiskLevel, number> = {
  low: 1,
  moderate: 2,
  high: 3,
  severe: 4,
};

function scoreEvidence(e: Evidence): number {
  const text = `${e.title} ${e.summary} ${e.rawHint ?? ""}`.toLowerCase();

  // Explicit calm / negative findings — do not inflate risk.
  if (
    /no high-signal|none matched|no metar|no taf|returned 0 alert|vfr \(good/.test(
      text,
    )
  ) {
    return 0;
  }

  // Forecast summaries that are clearly benign.
  if (
    /\bclear\b/.test(text) &&
    !/thunder|snow|fog|heavy|violent|blizzard|hurricane/.test(text)
  ) {
    const gustMatch = text.match(/gusts? (?:to )?(\d+)/);
    const windMatch = text.match(/max wind (\d+)/);
    const gust = gustMatch ? Number(gustMatch[1]) : 0;
    const wind = windMatch ? Number(windMatch[1]) : 0;
    if (gust < 55 && wind < 40) return 0;
  }

  if (
    /lifr|blizzard|hurricane|tornado|ice storm|severe thunderstorm|violent/.test(
      text,
    )
  ) {
    return 4;
  }
  if (
    /\bifr\b|winter storm|heavy snow|thunderstorm|flash flood|high wind|gusting [3-9]\d|gusts? (?:to )?[6-9]\d/.test(
      text,
    )
  ) {
    return 3;
  }
  if (
    /mvfr|dense fog|freezing fog|\bsnow\b|heavy rain|elevated winds|wind shear|tsra|\bts\b/.test(
      text,
    )
  ) {
    return 2;
  }
  // TEMPO/BECMG alone is weak signal unless paired with impact weather.
  if (
    /tempo|becmg|prob30|prob40/.test(text) &&
    /rain|snow|fog|thunder|wind|ifr|mvfr/.test(text)
  ) {
    return 2;
  }

  return 0;
}

function levelFromScore(maxScore: number): RiskLevel {
  if (maxScore >= 4) return "severe";
  if (maxScore >= 3) return "high";
  if (maxScore >= 2) return "moderate";
  return "low";
}

function buildRisks(evidence: Evidence[]): Risk[] {
  const risks: Risk[] = [];
  const scored = evidence
    .map((e) => ({ e, score: scoreEvidence(e) }))
    .filter((x) => x.score >= 2)
    .sort((a, b) => b.score - a.score);

  const seen = new Set<string>();
  for (const { e, score } of scored) {
    const key = `${e.location}-${e.source}-${score >= 3 ? "hi" : "mid"}`;
    if (seen.has(key)) continue;
    seen.add(key);

    risks.push({
      id: `rules-risk-${risks.length + 1}`,
      title: e.title,
      severity: levelFromScore(score),
      summary: e.summary,
      evidenceIds: [e.id],
    });
    if (risks.length >= 6) break;
  }

  if (risks.length === 0 && evidence.length > 0) {
    const calm = evidence.filter((e) =>
      /no high-signal|none matched|vfr \(good|clear/i.test(
        `${e.title} ${e.summary}`,
      ),
    );
    const ids = (calm.length ? calm : evidence.slice(0, 2)).map((e) => e.id);
    risks.push({
      id: "rules-risk-baseline",
      title: "No elevated disruption signals detected",
      severity: "low",
      summary:
        "Available weather, alert, and aviation observations do not currently indicate material disruption for this city pair and date.",
      evidenceIds: ids,
    });
  }

  return risks;
}

function buildActions(
  overall: RiskLevel,
  origin: AirportRef,
  destination: AirportRef,
  evidence: Evidence[],
): Action[] {
  const ids = evidence.slice(0, 4).map((e) => e.id);
  const actions: Action[] = [];

  if (SEVERITY_SCORE[overall] >= 3) {
    actions.push({
      id: "action-now-1",
      priority: "now",
      text: `Flag ${origin.iata}→${destination.iata} as elevated disruption risk and notify travelers of possible delays or cancellations.`,
      evidenceIds: ids,
    });
    actions.push({
      id: "action-before-1",
      priority: "before_travel",
      text: `Prefer earlier departures and build longer connection buffers; re-check ${destination.icao} TAF and NWS alerts the evening prior.`,
      evidenceIds: ids,
    });
  } else if (SEVERITY_SCORE[overall] === 2) {
    actions.push({
      id: "action-before-1",
      priority: "before_travel",
      text: `Monitor ${origin.iata} and ${destination.iata} conditions the morning of travel; allow modest extra airport time.`,
      evidenceIds: ids,
    });
  } else {
    actions.push({
      id: "action-monitor-1",
      priority: "monitor",
      text: `Routine monitoring is sufficient; re-run assessment if forecasts deteriorate for ${origin.city} or ${destination.city}.`,
      evidenceIds: ids,
    });
  }

  actions.push({
    id: "action-monitor-taf",
    priority: "monitor",
    text: `Watch AviationWeather METARs/TAFs for ${origin.icao} and ${destination.icao} for flight-category changes.`,
    evidenceIds: evidence
      .filter((e) => e.source === "aviationweather")
      .map((e) => e.id)
      .slice(0, 4),
  });

  return actions;
}

export function synthesizeWithRules(input: {
  query: AssessmentQuery;
  origin: AirportRef;
  destination: AirportRef;
  evidence: Evidence[];
  partialFailures: string[];
}): AssessmentResponse {
  const { query, origin, destination, evidence, partialFailures } = input;
  const scores = evidence.map(scoreEvidence);
  const maxScore = scores.length ? Math.max(...scores) : 0;
  let overall = levelFromScore(maxScore);

  if (evidence.length === 0) {
    overall = "moderate";
  }

  const risks = buildRisks(evidence);
  const actions = buildActions(overall, origin, destination, evidence);

  const gaps: string[] = [];
  if (partialFailures.length) {
    gaps.push(
      `Incomplete inputs: ${partialFailures.join(", ")} unavailable.`,
    );
  }
  if (!evidence.some((e) => e.source === "aviationweather" && e.id.includes("taf") && !e.id.includes("missing"))) {
    gaps.push("Airport TAF coverage may be thin for afternoon/evening windows.");
  }
  if (evidence.length === 0) {
    gaps.push("No evidence retrieved from external sources.");
  }

  const confidenceBase =
    evidence.length === 0
      ? 0.2
      : partialFailures.length === 0
        ? 0.72
        : Math.max(0.35, 0.72 - partialFailures.length * 0.15);

  const narrative =
    overall === "low"
      ? `Conditions for ${origin.city} (${origin.iata}) to ${destination.city} (${destination.iata}) on ${query.date} look manageable. Forecast, NWS alerts, and aviation observations do not show material disruption signals. Continue routine monitoring.`
      : overall === "moderate"
        ? `Moderate disruption potential on ${query.date} for ${origin.iata}→${destination.iata}. Some weather or airport condition signals warrant extra buffer time and morning-of checks, but a wholesale cancellation environment is not clearly indicated from available evidence.`
        : overall === "high"
          ? `Elevated disruption risk for ${origin.iata}→${destination.iata} on ${query.date}. Evidence points to adverse weather and/or constrained airport conditions that commonly produce delays. Prioritize flexible itineraries and traveler notifications.`
          : `Severe disruption conditions are indicated for ${origin.iata}→${destination.iata} on ${query.date}. High-impact weather or aviation flight-category signals suggest a material chance the intended trip cannot complete on schedule. Escalate ops review and prepare contingency options.`;

  return validateAndSanitizeSynthesis(
    {
      overallRisk: overall,
      narrative,
      confidence: confidenceBase,
      gaps,
      risks,
      actions,
    },
    evidence,
    {
      query,
      partialFailures,
      synthesisMode: "rules",
    },
  );
}
