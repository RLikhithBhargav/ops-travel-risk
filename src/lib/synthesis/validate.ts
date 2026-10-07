import type { Action, AssessmentResponse, Evidence, Risk, RiskLevel } from "@/lib/types";

const RISK_LEVELS: RiskLevel[] = ["low", "moderate", "high", "severe"];

function isRiskLevel(v: unknown): v is RiskLevel {
  return typeof v === "string" && RISK_LEVELS.includes(v as RiskLevel);
}

function filterIds(ids: unknown, valid: Set<string>): string[] {
  if (!Array.isArray(ids)) return [];
  return ids
    .filter((id): id is string => typeof id === "string")
    .filter((id) => valid.has(id));
}

export function validateAndSanitizeSynthesis(
  raw: Partial<AssessmentResponse>,
  evidence: Evidence[],
  defaults: Pick<
    AssessmentResponse,
    "query" | "partialFailures" | "synthesisMode"
  >,
): AssessmentResponse {
  const validIds = new Set(evidence.map((e) => e.id));

  const risks: Risk[] = (Array.isArray(raw.risks) ? raw.risks : [])
    .map((r, i) => {
      const evidenceIds = filterIds(r?.evidenceIds, validIds);
      if (evidenceIds.length === 0 && evidence.length > 0) return null;
      return {
        id: typeof r?.id === "string" ? r.id : `risk-${i + 1}`,
        title: typeof r?.title === "string" ? r.title : "Unnamed risk",
        severity: isRiskLevel(r?.severity) ? r.severity : "moderate",
        summary:
          typeof r?.summary === "string" ? r.summary : "No summary provided.",
        evidenceIds,
      };
    })
    .filter((r): r is Risk => r !== null)
    .filter((r) => r.evidenceIds.length > 0 || evidence.length === 0);

  const actions: Action[] = (Array.isArray(raw.actions) ? raw.actions : [])
    .map((a, i) => {
      const priority =
        a?.priority === "now" ||
        a?.priority === "before_travel" ||
        a?.priority === "monitor"
          ? a.priority
          : "monitor";
      return {
        id: typeof a?.id === "string" ? a.id : `action-${i + 1}`,
        priority,
        text: typeof a?.text === "string" ? a.text : "Review conditions.",
        evidenceIds: filterIds(a?.evidenceIds, validIds),
      };
    })
    .filter((a) => typeof a.text === "string" && a.text.length > 0);

  const gaps = Array.isArray(raw.gaps)
    ? raw.gaps.filter((g): g is string => typeof g === "string")
    : [];

  let confidence =
    typeof raw.confidence === "number" && Number.isFinite(raw.confidence)
      ? Math.min(1, Math.max(0, raw.confidence))
      : 0.5;

  if (defaults.partialFailures.length > 0) {
    confidence = Math.min(confidence, 0.55);
  }

  return {
    query: defaults.query,
    overallRisk: isRiskLevel(raw.overallRisk) ? raw.overallRisk : "moderate",
    narrative:
      typeof raw.narrative === "string" && raw.narrative.trim()
        ? raw.narrative.trim()
        : "Assessment completed from available evidence.",
    confidence,
    gaps,
    risks,
    actions,
    evidence,
    synthesisMode: defaults.synthesisMode,
    partialFailures: defaults.partialFailures,
  };
}
