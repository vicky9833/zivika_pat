import { create } from "zustand";

// ─── BACKEND INTEGRATION NOTES ───────────────────────────────────────────────
// TODO: Replace mock initialization with:
//   const { data } = await convex.query(api.records.listByUser, { userId })
//   initialStore({ records: data })
// TODO: addRecord → convex.mutation(api.records.add, { ...record, userId })
// TODO: deleteRecord → convex.mutation(api.records.remove, { id, userId })
// ─────────────────────────────────────────────────────────────────────────────

let nextId = 2000;

export const useRecordsStore = create((set, get) => ({
  records: [],

  /** Add a new record; returns the saved record with generated id */
  addRecord: (record) => {
    const saved = {
      ...record,
      id: `scan-${++nextId}-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({ records: [saved, ...state.records] }));
    return saved;
  },

  /** All records, newest first */
  getRecords: () => get().records,

  /** Records filtered by type key (e.g. "lab", "prescription") */
  getRecordsByType: (type) => get().records.filter((r) => r.type === type),

  /** Find a single record by id */
  getRecordById: (id) => get().records.find((r) => r.id === id) || null,

  /** Remove a record by id */
  deleteRecord: (id) =>
    set((state) => ({ records: state.records.filter((r) => r.id !== id) })),
}));
