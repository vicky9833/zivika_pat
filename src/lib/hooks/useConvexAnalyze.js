"use client";

import { useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";

/**
 * useConvexAnalyze
 * Wraps the Groq vision-based report analysis Convex action.
 */
export function useConvexAnalyze() {
  const analyzeAction = useAction(api.ai.analyzeReport);

  async function analyzeReport(imageBase64, language = "en") {
    return await analyzeAction({ imageBase64, language, mimeType: "image/jpeg" });
  }

  return { analyzeReport };
}

