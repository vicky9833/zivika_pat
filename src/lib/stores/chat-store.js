import { create } from "zustand";

// ─── BACKEND INTEGRATION NOTES ───────────────────────────────────────────────
// TODO: Persist messages to Convex for chat history:
//   addMessage → convex.mutation(api.chat.addMessage, { userId, role, text, timestamp: Date.now() })
// TODO: Load history on mount:
//   const { data } = await convex.query(api.chat.history, { userId, limit: 50 })
// ─────────────────────────────────────────────────────────────────────────────

let nextId = 1;

export const useChatStore = create((set) => ({
  messages: [],

  addMessage: (role, text) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          id: `msg-${nextId++}-${Date.now()}`,
          role,
          text,
          timestamp: new Date(),
        },
      ],
    })),

  clearMessages: () => set({ messages: [] }),
}));
