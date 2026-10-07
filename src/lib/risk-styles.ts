import type { RiskLevel } from "@/lib/types";

export function riskLabel(level: RiskLevel): string {
  switch (level) {
    case "low":
      return "Low";
    case "moderate":
      return "Moderate";
    case "high":
      return "High";
    case "severe":
      return "Severe";
  }
}

export function riskTone(level: RiskLevel): string {
  switch (level) {
    case "low":
      return "var(--risk-low)";
    case "moderate":
      return "var(--risk-moderate)";
    case "high":
      return "var(--risk-high)";
    case "severe":
      return "var(--risk-severe)";
  }
}
