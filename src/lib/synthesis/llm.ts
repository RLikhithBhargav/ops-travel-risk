import OpenAI from "openai";
import type {
  AssessmentQuery,
  AssessmentResponse,
  Evidence,
  AirportRef,
} from "@/lib/types";
import { validateAndSanitizeSynthesis } from "@/lib/synthesis/validate";
import { synthesizeWithRules } from "@/lib/synthesis/rules";

const SYSTEM = `You are an operations assistant for U.S. air travel disruption assessment.
You receive ONLY normalized evidence JSON from weather and aviation APIs.
Synthesize an Ops-facing assessment. Do NOT invent flight numbers, airline cancellation decisions, weather numbers, alerts, URLs, or evidence IDs that are not present.
Every risk and action must cite evidenceIds from the provided evidence only.
Respond with a single JSON object matching this schema:
{
  "overallRisk": "low"|"moderate"|"high"|"severe",
  "narrative": string,
  "confidence": number,
  "gaps": string[],
  "risks": [{"id": string, "title": string, "severity": "low"|"moderate"|"high"|"severe", "summary": string, "evidenceIds": string[]}],
  "actions": [{"id": string, "priority": "now"|"before_travel"|"monitor", "text": string, "evidenceIds": string[]}]
}`;

function extractJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1] : text;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new Error("No JSON object in model response");
  }
  return JSON.parse(candidate.slice(start, end + 1));
}

export async function synthesizeWithLlm(input: {
  query: AssessmentQuery;
  origin: AirportRef;
  destination: AirportRef;
  evidence: Evidence[];
  partialFailures: string[];
}): Promise<AssessmentResponse> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return synthesizeWithRules(input);
  }

  try {
    const client = new OpenAI({ apiKey });
    const userPayload = {
      query: input.query,
      partialFailures: input.partialFailures,
      evidence: input.evidence.map((e) => ({
        id: e.id,
        source: e.source,
        title: e.title,
        summary: e.summary,
        location: e.location,
        url: e.url,
        observedAt: e.observedAt,
      })),
    };

    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM },
        {
          role: "user",
          content: `Assess disruption for this trip using only the evidence below.\n${JSON.stringify(userPayload)}`,
        },
      ],
    });

    const text = completion.choices[0]?.message?.content ?? "";
    const parsed = extractJson(text) as Partial<AssessmentResponse>;
    return validateAndSanitizeSynthesis(parsed, input.evidence, {
      query: input.query,
      partialFailures: input.partialFailures,
      synthesisMode: "llm",
    });
  } catch (err) {
    console.error("LLM synthesis failed, falling back to rules:", err);
    const fallback = synthesizeWithRules(input);
    return {
      ...fallback,
      gaps: [
        ...fallback.gaps,
        "LLM synthesis failed; used rules-based fallback.",
      ],
      confidence: Math.min(fallback.confidence, 0.6),
    };
  }
}
