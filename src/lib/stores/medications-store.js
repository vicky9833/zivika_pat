import { create } from "zustand";

// ─── BACKEND INTEGRATION NOTES ───────────────────────────────────────────────
// TODO: Replace mock data with:
//   const { data } = await convex.query(api.medications.listByUser, { userId })
// TODO: addMedication → convex.mutation(api.medications.add, { ...med, userId })
// TODO: toggleTaken → convex.mutation(api.medications.logDose, { medicationId, takenAt: Date.now(), status: 'taken' })
// TODO: logs → convex.query(api.medications.recentLogs, { userId, daysAgo: 30 })
// ─────────────────────────────────────────────────────────────────────────────

// ─── Helpers ─────────────────────────────────────────────────────────────────

function todayStr() {
  return new Date().toISOString().slice(0, 10); // "2026-04-07"
}

function dateStr(date) {
  return new Date(date).toISOString().slice(0, 10);
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

let logId = 1;

// ─── Store ───────────────────────────────────────────────────────────────────

export const useMedicationsStore = create((set, get) => ({
  medications: [],
  logs: [],

  // Add a new medication
  addMedication: (med) =>
    set((state) => ({
      medications: [
        ...state.medications,
        { ...med, id: `med-${Date.now()}`, taken: false, isToday: true },
      ],
    })),

  // Toggle taken status for today
  toggleTaken: (medicationId) => {
    const today = todayStr();
    set((state) => {
      const existing = state.logs.find(
        (l) => l.medicationId === medicationId && l.date === today && l.scheduledTime === "08:00"
      );
      if (existing) {
        // Toggle
        return {
          logs: state.logs.map((l) =>
            l.id === existing.id
              ? {
                  ...l,
                  status: l.status === "taken" ? "pending" : "taken",
                  takenAt: l.status === "taken" ? null : new Date().toISOString(),
                }
              : l
          ),
          medications: state.medications.map((m) =>
            m.id === medicationId ? { ...m, taken: existing.status !== "taken" } : m
          ),
        };
      }
      // Create new log entry for today
      const newLog = {
        id: `log-${logId++}`,
        medicationId,
        scheduledTime: "08:00",
        takenAt: new Date().toISOString(),
        status: "taken",
        date: today,
      };
      return {
        logs: [...state.logs, newLog],
        medications: state.medications.map((m) =>
          m.id === medicationId ? { ...m, taken: true } : m
        ),
      };
    });
  },

  // Get medications with today-taken status for a date
  getMedicationsForDate: (date) => {
    const ds = dateStr(date);
    const { medications, logs } = get();
    return medications.map((med) => {
      const dayLogs = logs.filter((l) => l.medicationId === med.id && l.date === ds);
      const taken = dayLogs.some((l) => l.status === "taken");
      const missed = dayLogs.some((l) => l.status === "missed");
      return { ...med, taken, missed };
    });
  },

  // Compute adherence % for a medication over the last N days
  getAdherence: (medicationId, days = 7) => {
    const { logs } = get();
    let taken = 0;
    let total = 0;
    for (let i = 1; i <= days; i++) {
      const d = daysAgo(i);
      const dayLogs = logs.filter((l) => l.medicationId === medicationId && l.date === d);
      if (dayLogs.length > 0) {
        total += dayLogs.length;
        taken += dayLogs.filter((l) => l.status === "taken").length;
      }
    }
    return total === 0 ? 100 : Math.round((taken / total) * 100);
  },

  // Get overall adherence for all medications today
  getTodayAdherence: () => {
    const { medications, logs } = get();
    const today = todayStr();
    const todayMeds = medications.filter((m) => m.isToday);
    const takenToday = todayMeds.filter((m) =>
      logs.some((l) => l.medicationId === m.id && l.date === today && l.status === "taken")
    ).length;
    return { taken: takenToday, total: todayMeds.length };
  },

  // Get week adherence %
  getWeekAdherence: () => {
    const { logs } = get();
    const all = logs.filter((l) => {
      const d = new Date(l.date);
      const diff = Math.round((new Date() - d) / (86400 * 1000));
      return diff <= 7;
    });
    if (all.length === 0) return 0;
    const taken = all.filter((l) => l.status === "taken").length;
    return Math.round((taken / all.length) * 100);
  },

  // Get daily status for calendar strip: for each of last 7 days
  getWeekCalendar: () => {
    const { medications, logs } = get();
    const todayMs = medications.filter((m) => m.isToday);
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const ds = d.toISOString().slice(0, 10);
      const isToday = i === 0;
      const isFuture = false; // all 7 days are past or today

      const dayLogs = logs.filter((l) => todayMs.some((m) => m.id === l.medicationId) && l.date === ds);
      const takenCount = dayLogs.filter((l) => l.status === "taken").length;
      const total = todayMs.filter((m) => m.isToday || !m.isToday).length; // all meds

      let status;
      if (isToday) {
        status = "today";
      } else if (dayLogs.length === 0) {
        status = "none";
      } else if (takenCount === 0) {
        status = "missed";
      } else if (takenCount >= total) {
        status = "full";
      } else {
        status = "partial";
      }
      result.push({ date: d, ds, isToday, status, taken: takenCount, total });
    }
    return result;
  },
}));
