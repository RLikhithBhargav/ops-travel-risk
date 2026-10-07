"use client";

import { useState } from "react";
import {
  AssessmentForm,
  type AssessmentFormValues,
} from "@/components/assessment-form";
import { AssessmentResults } from "@/components/assessment-results";
import { LoadingSources } from "@/components/loading-sources";
import type { AssessmentResponse } from "@/lib/types";

type Phase = "idle" | "loading" | "success" | "error";

export function AssessmentApp() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AssessmentResponse | null>(null);

  const run = async (values: AssessmentFormValues) => {
    setPhase("loading");
    setError(null);
    try {
      const res = await fetch("/api/assess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const payload = await res.json();
      if (!res.ok) {
        throw new Error(payload?.error ?? "Assessment failed.");
      }
      setResult(payload as AssessmentResponse);
      setPhase("success");
    } catch (err) {
      setResult(null);
      setError(err instanceof Error ? err.message : "Assessment failed.");
      setPhase("error");
    }
  };

  return (
    <div className="app-shell">
      <section className="hero">
        <div className="hero-atmosphere" aria-hidden />
        <div className="hero-content">
          <p className="brand">nuKudo</p>
          <h1>Assess U.S. travel disruption</h1>
          <p className="lede">
            City pair and date in — live weather, alerts, and aviation signals
            out, synthesized into an evidence-backed ops view.
          </p>
          <AssessmentForm disabled={phase === "loading"} onSubmit={run} />
          {phase === "loading" && <LoadingSources />}
          {phase === "error" && error && (
            <div className="banner error" role="alert">
              <p>{error}</p>
              <p className="muted">Adjust the cities or date and try again.</p>
            </div>
          )}
        </div>
      </section>

      {phase === "success" && result && <AssessmentResults data={result} />}
    </div>
  );
}
