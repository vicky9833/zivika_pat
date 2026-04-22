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
    if (!userId) throw new Error("No user");

    // Save user message immediately
    await saveMessageMutation({
      userId,
      role:     "user",
      content,
      mode,
      language: language ?? "en",
    });

    // Build messages array from current history + new user message
    const history = (messages ?? []).map((m) => ({
      role:    m.role,
      content: m.content,
    }));
    history.push({ role: "user", content });

    // Call Groq via Convex action
    const result = await chatAction({
      messages: history,
      mode,
      language: language ?? "en",
      healthContext,
      user,
    });

    // Save assistant response
    await saveMessageMutation({
      userId,
      role:     "assistant",
      content:  result.content,
      mode,
      language: language ?? "en",
    });

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

