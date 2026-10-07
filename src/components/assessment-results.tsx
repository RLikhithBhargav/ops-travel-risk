"use client";

import { useMemo, useState } from "react";
import type { AssessmentResponse, Evidence, RiskLevel } from "@/lib/types";
import { riskLabel, riskTone } from "@/lib/risk-styles";

interface AssessmentResultsProps {
  data: AssessmentResponse;
}

function evidenceById(evidence: Evidence[]): Map<string, Evidence> {
  return new Map(evidence.map((e) => [e.id, e]));
}

function EvidenceChips({
  ids,
  map,
  onOpen,
}: {
  ids: string[];
  map: Map<string, Evidence>;
  onOpen: (id: string) => void;
}) {
  if (!ids.length) return null;
  return (
    <div className="evidence-chips">
      {ids.map((id) => {
        const e = map.get(id);
        return (
          <button
            key={id}
            type="button"
            className="evidence-chip"
            onClick={() => onOpen(id)}
            title={e?.title ?? id}
          >
            {e?.source ?? id}
          </button>
        );
      })}
    </div>
  );
}

function RiskBadge({ level }: { level: RiskLevel }) {
  return (
    <span
      className="risk-badge"
      style={{ ["--tone" as string]: riskTone(level) }}
    >
      {riskLabel(level)} risk
    </span>
  );
}

export function AssessmentResults({ data }: AssessmentResultsProps) {
  const map = useMemo(() => evidenceById(data.evidence), [data.evidence]);
  const [expandedEvidence, setExpandedEvidence] = useState(true);
  const [highlightId, setHighlightId] = useState<string | null>(null);

  const openEvidence = (id: string) => {
    setExpandedEvidence(true);
    setHighlightId(id);
    window.requestAnimationFrame(() => {
      document.getElementById(`evidence-${id}`)?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    });
  };

  return (
    <section className="results" aria-label="Assessment results">
      {data.partialFailures.length > 0 && (
        <div className="banner warn" role="status">
          Assessment incomplete —{" "}
          {data.partialFailures.join(", ")} unavailable.
        </div>
      )}

      <header className="results-hero">
        <div className="results-meta">
          <p className="route-line">
            {data.query.originAirport.iata} → {data.query.destinationAirport.iata}
            <span className="muted">
              {" "}
              · {data.query.date} · {data.query.originAirport.name} to{" "}
              {data.query.destinationAirport.name}
            </span>
          </p>
          <RiskBadge level={data.overallRisk} />
        </div>
        <p className="narrative">{data.narrative}</p>
        <div className="confidence-row">
          <span>
            Confidence {(data.confidence * 100).toFixed(0)}%
            {data.synthesisMode === "rules"
              ? " · Rule-based synthesis (no LLM key)"
              : " · OpenAI synthesis"}
          </span>
          {data.gaps.length > 0 && (
            <ul className="gaps">
              {data.gaps.map((g) => (
                <li key={g}>{g}</li>
              ))}
            </ul>
          )}
        </div>
      </header>

      <div className="results-body">
        <section>
          <h2>Risks</h2>
          {data.risks.length === 0 ? (
            <p className="muted">No prioritized risks after citation validation.</p>
          ) : (
            <ul className="risk-list">
              {data.risks.map((r) => (
                <li key={r.id} className="risk-item">
                  <div className="risk-head">
                    <h3>{r.title}</h3>
                    <RiskBadge level={r.severity} />
                  </div>
                  <p>{r.summary}</p>
                  <EvidenceChips
                    ids={r.evidenceIds}
                    map={map}
                    onOpen={openEvidence}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2>Recommended actions</h2>
          <ul className="action-list">
            {data.actions.map((a) => (
              <li key={a.id}>
                <span className={`priority priority-${a.priority}`}>
                  {a.priority.replace("_", " ")}
                </span>
                <div>
                  <p>{a.text}</p>
                  <EvidenceChips
                    ids={a.evidenceIds}
                    map={map}
                    onOpen={openEvidence}
                  />
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <button
            type="button"
            className="evidence-toggle"
            onClick={() => setExpandedEvidence((v) => !v)}
            aria-expanded={expandedEvidence}
          >
            Evidence ({data.evidence.length}){" "}
            {expandedEvidence ? "▾" : "▸"}
          </button>
          {expandedEvidence && (
            <ul className="evidence-list">
              {data.evidence.map((e) => (
                <li
                  key={e.id}
                  id={`evidence-${e.id}`}
                  className={
                    highlightId === e.id ? "evidence-item highlight" : "evidence-item"
                  }
                >
                  <div className="evidence-head">
                    <span className="source-tag">{e.source}</span>
                    <strong>{e.title}</strong>
                  </div>
                  <p>{e.summary}</p>
                  <div className="evidence-foot">
                    <span className="muted">
                      Fetched {new Date(e.fetchedAt).toLocaleString()}
                      {e.location ? ` · ${e.location}` : ""}
                    </span>
                    {e.url && (
                      <a href={e.url} target="_blank" rel="noreferrer">
                        Source
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </section>
  );
}
