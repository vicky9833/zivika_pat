"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

// Normal ranges for each vital type (for status calculation)
const NORMAL_RANGES = {
  heartRate:     { min: 60,  max: 100,  unit: "bpm" },
  bloodPressure: { min: 90,  max: 120,  unit: "mmHg" }, // systolic
  bloodSugar:    { min: 70,  max: 100,  unit: "mg/dL" },
  weight:        { min: 40,  max: 100,  unit: "kg" },
  spo2:          { min: 95,  max: 100,  unit: "%" },
  temp:          { min: 36.1,max: 37.2, unit: "°C" },
  steps:         { min: 8000,max: 12000,unit: "steps" },
  sleep:         { min: 7,   max: 9,    unit: "hrs" },
  hrv:           { min: 20,  max: 65,   unit: "ms" },
};

function getStatus(type, value) {
  const range = NORMAL_RANGES[type];
  if (!range) return { label: "—", color: "#8EBAA3" };
  const v = type === "bloodPressure" ? (value?.systolic ?? value) : value;
  if (v < range.min) return { label: "Low",    color: "#2563EB" };
  if (v > range.max) return { label: "High",   color: "#DC2626" };
  return { label: "Normal", color: "#0D6E4F" };
}

/**
 * processVitals
 * Takes a raw array of Convex vitals and produces a latestMap (one per type)
 * and a historyMap (array of entries per type, most recent first).
 */
export function processVitals(rawVitals = []) {
  const latestMap  = {};
  const historyMap = {};

  for (const v of rawVitals) {
    if (!historyMap[v.type]) historyMap[v.type] = [];
    historyMap[v.type].push(v);
  }

  for (const [type, entries] of Object.entries(historyMap)) {
    const sorted = [...entries].sort(
      (a, b) => new Date(b.recordedAt) - new Date(a.recordedAt)
    );
    historyMap[type] = sorted;
    const latest = sorted[0];
    const prev   = sorted[1];
    const status = getStatus(type, latest.value);
    latestMap[type] = {
      value:       latest.value,
      unit:        latest.unit ?? NORMAL_RANGES[type]?.unit,
      statusLabel: status.label,
      statusColor: status.color,
      trend:       prev
        ? (latest.value > prev.value ? "up" : latest.value < prev.value ? "down" : "stable")
        : "stable",
      normalRange: NORMAL_RANGES[type],
    };
  }

  return { latestMap, historyMap };
}

/**
 * useConvexVitals
 */
export function useConvexVitals(convexUser) {
  const userId = convexUser?._id;

  const rawVitals = useQuery(
    api.vitals.listByUser,
    userId ? { userId } : "skip"
  );

  const logVitalMutation    = useMutation(api.vitals.log);
  const removeVitalMutation = useMutation(api.vitals.remove);

  async function logVital(data) {
    if (!userId) throw new Error("No user");
    return await logVitalMutation({ userId, ...data });
  }

  async function removeVital(id) {
    await removeVitalMutation({ id });
  }

  const { latestMap, historyMap } = processVitals(rawVitals);

  return {
    rawVitals:  rawVitals ?? [],
    latestMap,
    historyMap,
    isLoading:  rawVitals === undefined,
    logVital,
    removeVital,
    getNormalRange: (type) => NORMAL_RANGES[type] ?? null,
  };
}

