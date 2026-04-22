"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

/**
 * useConvexMedications
 */
export function useConvexMedications(convexUser) {
  const userId = convexUser?._id;

  const activeMeds = useQuery(
    api.medications.listActive,
    userId ? { userId } : "skip"
  );

  const allMeds = useQuery(
    api.medications.listAll,
    userId ? { userId } : "skip"
  );

  const today = new Date().toISOString().slice(0, 10);

  const todayLogs = useQuery(
    api.medications.getLogsByDate,
    userId ? { userId, date: today } : "skip"
  );

  const createMutation = useMutation(api.medications.create);
  const updateMutation = useMutation(api.medications.update);
  const removeMutation = useMutation(api.medications.remove);
  const logDoseMutation = useMutation(api.medications.logDose);

  async function createMedication(data) {
    if (!userId) throw new Error("No user");
    return await createMutation({ userId, ...data });
  }

  async function updateMedication(id, data) {
    await updateMutation({ id, ...data });
  }

  async function removeMedication(id) {
    await removeMutation({ id });
  }

  async function logDose(medicationId, time, taken) {
    if (!userId) throw new Error("No user");
    await logDoseMutation({
      userId,
      medicationId,
      date: today,
      time,
      taken,
    });
  }

  // Build today's medication schedule with taken status
  const todayMeds = (activeMeds ?? []).map((med) => {
    const dosesTaken = (todayLogs ?? []).filter(
      (log) => log.medicationId === med._id && log.taken
    );
    return { ...med, takenToday: dosesTaken.length > 0, takenCount: dosesTaken.length };
  });

  const adherenceToday =
    todayMeds.length > 0
      ? Math.round((todayMeds.filter((m) => m.takenToday).length / todayMeds.length) * 100)
      : null;

  return {
    activeMeds:     activeMeds ?? [],
    allMeds:        allMeds ?? [],
    todayMeds,
    todayLogs:      todayLogs ?? [],
    adherenceToday,
    isLoading:      activeMeds === undefined,
    createMedication,
    updateMedication,
    removeMedication,
    logDose,
  };
}

