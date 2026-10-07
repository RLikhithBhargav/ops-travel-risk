import Anthropic from "@anthropic-ai/sdk";
import type {
  AssessmentQuery,
  AssessmentResponse,
  Evidence,
} from "@/lib/types";
import { validateAndSanitizeSynthesis } from "@/lib/synthesis/validate";
import { synthesizeWithRules } from "@/lib/synthesis/rules";
import type { AirportRef } from "@/lib/types";

const SYSTEM = `You are an operations assistant for U.S. air travel disruption assessment.\nYou receive ONLY normalized evidence JSON from weather and aviation APIs.\nSynthesize an Ops-facing assessment. Do NOT invent flight numbers, airline cancellation decisions, weather numbers, alerts, URLs, or evidence IDs that are not present.\nEvery risk and action must cite evidenceIds from the provided evidence only.\nRespond with a single JSON object matching this schema:\n{\n  "overallRisk": "low"|"moderate"|"high"|"severe",\n  "narrative": string,\n  "confidence": number,\n  "gaps": string[],\n  "risks": [{"id": string, "title": string, "severity": "low"|"moderate"|"high"|"severe", "summary": string, "evidenceIds": string[]}],\n  "actions": [{"id": string, "priority": "now"|"before_travel"|"monitor", "text": string, "evidenceIds": string[]}]\n}`;

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
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return synthesizeWithRules(input);
  }

  try {
    const client = new Anthropic({ apiKey });
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

    const message = await client.messages.create({
      model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514",
      max_tokens: 2000,
      system: SYSTEM,
      messages: [
        {
          role: "user",
          content: `Assess disruption for this trip using only the evidence below.\n${JSON.stringify(userPayload)}`,
        },
      ],
    });

    const text = message.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n");

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
