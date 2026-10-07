import { NextResponse } from "next/server";
import { AssessError, runAssessment } from "@/lib/assess";
import type { AssessRequestBody } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as AssessRequestBody;
    const assessment = await runAssessment({
      originCity: body.originCity,
      destinationCity: body.destinationCity,
      date: body.date,
    });
    return NextResponse.json(assessment);
  } catch (err) {
    if (err instanceof AssessError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("Assess route error:", err);
    return NextResponse.json(
      { error: "Unexpected server error while running assessment." },
      { status: 500 },
    );
  }
}
