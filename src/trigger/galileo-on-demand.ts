import { task } from "@trigger.dev/sdk/v3";
import { askGalileo } from "../lib/galileo";
import { findPrompt } from "./_galileo-prompts";

/**
 * Galileo on-demand query.
 *
 * Standard "ask Galileo" tool. Any agent or backend caller may invoke this
 * with either an ad-hoc `query` string OR a `promptId` from the versioned
 * prompt library. The full prompt + answer + cited links + duration are
 * returned (and, once Phase 5 ships, will also be journaled to BigQuery
 * table `logrocket_galileo.on_demand_queries` for auditability).
 *
 * Invocation from another Trigger.dev task:
 *
 *   import { tasks } from "@trigger.dev/sdk/v3";
 *   import type { galileoOnDemand } from "./galileo-on-demand";
 *   const result = await tasks.triggerAndWait<typeof galileoOnDemand>(
 *     "galileo-on-demand",
 *     { promptId: "daily.top_friction" }
 *   );
 *
 * Invocation from a Paperclip agent: call the Trigger.dev API directly,
 * or (preferred) hit the LogRocket MCP `use_logrocket` tool from the
 * agent's own MCP-enabled session.
 */
export const galileoOnDemand = task({
  id: "galileo-on-demand",
  retry: {
    maxAttempts: 3,
    factor: 2,
    minTimeoutInMs: 5_000,
    maxTimeoutInMs: 60_000,
    randomize: false,
  },
  run: async (payload: {
    query?: string;
    promptId?: string;
    originatingAgentId?: string;   // For BigQuery journal attribution (Phase 5)
    originatingTaskId?: string;
  }) => {
    let queryText = payload.query;
    let promptVersion: string | undefined;
    let promptId: string | undefined;

    if (payload.promptId) {
      const prompt = findPrompt(payload.promptId);
      if (!prompt) {
        throw new Error(`Unknown promptId: ${payload.promptId}`);
      }
      queryText = prompt.text;
      promptVersion = prompt.version;
      promptId = prompt.id;
    }

    if (!queryText) {
      throw new Error("Must provide either `query` or `promptId`");
    }

    const result = await askGalileo(queryText, { promptVersion });

    return {
      promptId,
      promptVersion,
      query: queryText,
      status: result.status,
      text: result.text,
      links: result.links,
      chatID: result.chatID,
      durationMs: result.durationMs,
      originatingAgentId: payload.originatingAgentId,
      originatingTaskId: payload.originatingTaskId,
      // rawMessages omitted from the task output to keep the log readable.
      // Phase 5 ingest pulls the full payload from BigQuery instead.
    };
  },
});
