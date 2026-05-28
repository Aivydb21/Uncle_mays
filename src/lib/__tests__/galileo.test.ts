/**
 * Unit tests for askGalileo() — specifically the isTerminalMessage handling
 * and meta-narration filtering (UNC-1220).
 *
 * Run with: node --experimental-strip-types src/lib/__tests__/galileo.test.ts
 * (Node 22.6+ supports TS stripping; no extra toolchain required)
 */

import assert from "node:assert/strict";
import { describe, it, mock, beforeEach, afterEach } from "node:test";

// ─── Helpers to build fake MCP SSE envelopes ─────────────────────────────────

function makeEnvelope(
  messages: Array<{ messageContent: string; isTerminalMessage?: boolean }>,
  status: "completed" | "thinking" = "completed",
  chatID = "test-chat-id"
) {
  const payload = {
    status,
    chatID,
    messages,
  };
  return {
    result: {
      content: [{ type: "text", text: JSON.stringify(payload) }],
    },
  };
}

// ─── Import the module under test ─────────────────────────────────────────────

// We need to mock `fetch` (used internally by mcpCall) and the PAT env var.
// Because galileo.ts reads LOGROCKET_PAT at call-time, we set it here.
process.env.LOGROCKET_PAT = "pat:test:test:test";
process.env.LOGROCKET_MCP_URL = "https://mcp.logrocket.test/mcp";

// Dynamic import so we can set env vars before the module evaluates.
const { askGalileo } = await import("../galileo.js");

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("askGalileo — isTerminalMessage handling (UNC-1220)", () => {
  let originalFetch: typeof globalThis.fetch;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  function fakeFetchResponse(envelope: unknown) {
    const body = `data: ${JSON.stringify({ result: (envelope as any).result })}\n\n`;
    return Promise.resolve({
      ok: true,
      text: () => Promise.resolve(body),
    } as Response);
  }

  it("returns only the terminal message text when 3 thinking + 1 terminal", async () => {
    const thinkingMessages = [
      { messageContent: "Watching Sessions: Analyze what happened when the user clicked...", isTerminalMessage: false },
      { messageContent: "Building Metric: Calculating drop-off rate...", isTerminalMessage: false },
      { messageContent: "Querying session data for user cohort...", isTerminalMessage: false },
    ];
    const terminalMessage = {
      messageContent: "The user clicked the time slot and was shown a loading spinner for 8 seconds before the slot disappeared. 63% of users who hit this flow exited without booking.",
      isTerminalMessage: true,
    };

    // Single completed response with all 4 messages
    const envelope = makeEnvelope([...thinkingMessages, terminalMessage], "completed");

    globalThis.fetch = () => fakeFetchResponse(envelope);

    const result = await askGalileo("What happened with time slot clicks?");

    assert.equal(result.status, "completed");
    assert.equal(result.text, terminalMessage.messageContent);
    assert.ok(!result.text.includes("Watching Sessions"), "Should not include meta-narration");
    assert.ok(!result.text.includes("Building Metric"), "Should not include meta-narration");
    assert.ok(!result.text.includes("Querying"), "Should not include meta-narration");
  });

  it("returns status=thinking and empty text when all messages are meta-narration", async () => {
    const thinkingMessages = [
      { messageContent: "Watching Sessions: Analyzing user click patterns...", isTerminalMessage: false },
      { messageContent: "Building Metric: Computing funnel drop-off...", isTerminalMessage: false },
      { messageContent: "Querying database for session events...", isTerminalMessage: false },
    ];

    // All thinking messages, status=thinking (poll cap reached)
    const envelope = makeEnvelope(thinkingMessages, "thinking");

    let callCount = 0;
    globalThis.fetch = () => {
      callCount += 1;
      return fakeFetchResponse(envelope);
    };

    // Patch setTimeout to avoid 10-min wait in tests — resolve immediately
    const originalSetTimeout = globalThis.setTimeout;
    (globalThis as any).setTimeout = (fn: () => void, _ms: number) => {
      fn();
      return 0 as unknown as ReturnType<typeof setTimeout>;
    };

    try {
      const result = await askGalileo("What happened with time slot clicks?");

      assert.equal(result.status, "thinking", "Status must be thinking, not completed");
      assert.equal(result.text, "", "Text must be empty — no terminal answer received");
      assert.ok(!result.text.includes("Watching Sessions"), "Must not surface meta-narration as answer");
    } finally {
      globalThis.setTimeout = originalSetTimeout;
    }
  });

  it("returns completed_no_terminal with narration + citedSessions when status=completed but no terminal message (UNC-1383)", async () => {
    // Galileo finished its tools (outer status flipped to "completed") but
    // never emitted an isTerminalMessage:true — answered via chart-builder.
    const messages = [
      {
        messageContent:
          "Building Metric: drop_off_after_cart\nhttps://app.logrocket.com/mk3nrx/uncle_mays/charts/met_abc123",
        isTerminalMessage: false,
      },
      {
        messageContent:
          "Watching Sessions: representative pre-fix sessions\n" +
          "- https://app.logrocket.com/mk3nrx/uncle_mays/s/6-019e3f4a-08c2-77df-a6ad-d1bc9009c566/0\n" +
          "- https://app.logrocket.com/mk3nrx/uncle_mays/s/6-019e3d24-2783-7b02-82c9-66d34ce24918/0",
        isTerminalMessage: false,
      },
    ];

    const envelope = makeEnvelope(messages, "completed");
    globalThis.fetch = () => fakeFetchResponse(envelope);

    const result = await askGalileo("Any post-fix sessions of the time-slot pattern?");

    assert.equal(result.status, "completed_no_terminal", "outer status=completed + no terminal → completed_no_terminal");
    assert.ok(result.text.length > 0, "text should hold the meta-narration so callers can cite it");
    assert.ok(result.text.includes("Building Metric"), "narration is the load-bearing text");
    assert.equal(result.citedSessions.length, 2, "session URLs surfaced in citedSessions");
    assert.ok(
      result.citedSessions.every((u) => /\/s\/[A-Za-z0-9_-]+\/\d+/.test(u)),
      "every citedSessions entry matches the LogRocket session URL shape"
    );
    assert.ok(result.metricIds.includes("met_abc123"), "metric IDs extracted from /charts/<id> URLs");
  });

  it("still returns status=thinking when poll cap hit and outer status never flipped to completed", async () => {
    // Stream stays in `thinking` indefinitely → completed_no_terminal must NOT fire.
    const thinkingMessages = [
      { messageContent: "Watching Sessions: still analyzing...", isTerminalMessage: false },
    ];
    const envelope = makeEnvelope(thinkingMessages, "thinking");
    globalThis.fetch = () => fakeFetchResponse(envelope);

    const originalSetTimeout = globalThis.setTimeout;
    (globalThis as any).setTimeout = (fn: () => void, _ms: number) => {
      fn();
      return 0 as unknown as ReturnType<typeof setTimeout>;
    };

    try {
      const result = await askGalileo("?");
      assert.equal(result.status, "thinking");
      assert.equal(result.text, "");
    } finally {
      globalThis.setTimeout = originalSetTimeout;
    }
  });

  it("uses the last terminal message when multiple appear in the stream", async () => {
    const messages = [
      { messageContent: "Watching Sessions: Starting analysis...", isTerminalMessage: false },
      { messageContent: "Intermediate finding: some early data.", isTerminalMessage: true },
      { messageContent: "Final answer: 72% of users exited at the payment step due to missing Apple Pay.", isTerminalMessage: true },
    ];

    const envelope = makeEnvelope(messages, "completed");
    globalThis.fetch = () => fakeFetchResponse(envelope);

    const result = await askGalileo("What is the top exit point?");

    assert.equal(result.status, "completed");
    // Should use the LAST terminal message
    assert.equal(result.text, "Final answer: 72% of users exited at the payment step due to missing Apple Pay.");
  });
});
