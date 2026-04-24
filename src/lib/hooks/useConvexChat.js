"use client";

import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";

/**
 * useConvexChat
 * Provides persistent, real-time chat powered by Groq (via Convex action).
 */
export function useConvexChat(convexUser, mode = "copilot") {
  const userId = convexUser?._id;

  const messages = useQuery(
    api.chat.getHistory,
    userId ? { userId, mode } : "skip"
  );

  const saveMessageMutation  = useMutation(api.chat.saveMessage);
  const clearHistoryMutation = useMutation(api.chat.clearHistory);
  const chatAction           = useAction(api.ai.chat);

  async function sendMessage(content, language, healthContext, user) {
    // Save user message only if user exists in Convex DB.
    // If auth is not yet synced, we still run the AI and return a response.
    if (userId) {
      try {
        await saveMessageMutation({
          userId,
          role:     "user",
          content,
          mode,
          language: language ?? "en",
        });
      } catch (e) {
        console.warn("[chat] Could not save user message:", e?.message);
      }
    }

    // Build messages array from current history + new user message
    const history = (messages ?? []).map((m) => ({
      role:    m.role,
      content: m.content,
    }));
    history.push({ role: "user", content });

    // Call AI action (works without auth — no DB writes inside)
    const result = await chatAction({
      messages: history,
      mode,
      nativeLanguage: language ?? "en",
      healthContext,
      user,
    });

    // Persist assistant response if we have a user ID
    if (userId) {
      try {
        await saveMessageMutation({
          userId,
          role:     "assistant",
          content:  result.content,
          mode,
          language: language ?? "en",
        });
      } catch (e) {
        console.warn("[chat] Could not save assistant message:", e?.message);
      }
    }

    return result.content;
  }

  async function clearHistory() {
    if (!userId) return;
    await clearHistoryMutation({ userId, mode });
  }

  return {
    messages:     messages ?? [],
    isLoading:    messages === undefined,
    sendMessage,
    clearHistory,
  };
}

