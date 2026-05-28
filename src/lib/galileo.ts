/**
 * Galileo MCP client (server-side).
 *
 * Galileo AI is the source of truth on user behavior on unclemays.com — see
 * the LogRocket Standing Operating Procedure in every active Paperclip
 * AGENTS.md (marker LOGROCKET-CLAUSE-2026-05-14). This module is how the
 * Trigger.dev jobs and backend code reach Galileo.
 *
 * Auth: PAT lives in env (LOGROCKET_PAT) — set both in Vercel and in the
 * Trigger.dev project envs. The PAT is the same value as the `pat` field
 * in ~/.claude/logrocket-config.json (format: pat:<org>:<app>:<token>).
 *
 * Protocol: JSON-RPC 2.0 over HTTP, response is SSE (one `data:` line per
 * message). Galileo queries can take up to 10 minutes — the MCP returns
 * `status: "thinking"` with a `chatID` and the caller is expected to poll
 * the same chatID with `pollForResult: true` until `status: "completed"`.
 */

const MCP_URL = process.env.LOGROCKET_MCP_URL || "https://mcp.logrocket.com/mcp";
const MAX_POLLS = 30;        // 30 polls * 20s = 10 minutes total wait
const POLL_INTERVAL_MS = 20_000;

export interface GalileoResult {
  /**
   * Disposition of the run:
   *   - "completed": Galileo emitted an `isTerminalMessage: true` message;
   *     `text` is the verbatim answer.
   *   - "completed_no_terminal": MCP stream closed normally (outer status flipped
   *     to "completed") but no terminal message was ever emitted. This is the
   *     "Galileo answered with charts, not prose" case — common when the run
   *     built session-filter metrics and cited example sessions but never wrote
   *     a prose conclusion. `text` is the meta-narration (Building Metric: /
   *     Watching Sessions: lines) and `citedSessions` / `metricIds` carry the
   *     structured signal a caller needs to disposition without scraping URLs.
   *   - "thinking": Poll cap hit or the stream never finished — answer is
   *     truly incomplete and the caller should NOT treat this as a finding.
   *   - "error": Transport / RPC error from the MCP.
   */
  status: "completed" | "completed_no_terminal" | "thinking" | "error";
  text: string;                  // Galileo's verbatim answer (terminal text) or, for completed_no_terminal, the joined meta-narration
  links: string[];               // Every link Galileo cited — preserve all (per MCP contract)
  /**
   * LogRocket session URLs cited by Galileo during the run (subset of `links`).
   * Format: `https://app.logrocket.com/<org>/<app>/s/<sessionID>/<n>`.
   * Use this to disposition Layer 3 rechecks: zero post-fix sessions cited
   * after a fix ships is evidence the frustration pattern dropped.
   */
  citedSessions: string[];
  /**
   * IDs of metrics Galileo built or referenced during the run. Extracted from
   * URLs (`/metrics/<id>`, `/charts/<id>`, `/m/<id>`) and from explicit
   * `metricID` / `metricId` fields on the message stream. "Galileo built N
   * session-filter metrics, no matching sessions" is a disposition signal.
   */
  metricIds: string[];
  chatID?: string;
  promptVersion?: string;        // Echo back the prompt version for journaling
  rawMessages: unknown[];        // Full message stream for the BigQuery journal
  durationMs: number;
}

interface McpToolCallParams {
  query: string;
  chatID?: string;
  pollForResult?: boolean;
}

interface McpEnvelope {
  result?: {
    content?: Array<{ type: string; text: string }>;
    isError?: boolean;
    status?: "completed" | "thinking";
    chatID?: string;
    messages?: Array<{ role?: string; text?: string; content?: string }>;
    [key: string]: unknown;
  };
  error?: { code: number; message: string };
}

function getPat(): string {
  const pat = process.env.LOGROCKET_PAT;
  if (!pat) {
    throw new Error(
      "LOGROCKET_PAT not set. Add it to Vercel and Trigger.dev project envs " +
        "(value is the `pat` field in ~/.claude/logrocket-config.json)."
    );
  }
  return pat;
}

/**
 * One JSON-RPC request to the MCP. Parses the SSE response into a single
 * envelope (we only ever expect one logical message per call here — the
 * SSE wrapping is incidental).
 */
async function mcpCall(method: string, params: unknown, requestId = 1): Promise<McpEnvelope> {
  const res = await fetch(MCP_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getPat()}`,
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
    },
    body: JSON.stringify({ jsonrpc: "2.0", id: requestId, method, params }),
  });
  if (!res.ok) {
    throw new Error(`Galileo MCP HTTP ${res.status}: ${await res.text().catch(() => "")}`);
  }
  const raw = await res.text();
  // SSE: lines like `event: message\ndata: {...}\n\n`. There may be multiple
  // `data:` lines; we take the last one — the MCP server only emits one
  // logical envelope per tool/call invocation today.
  const dataLines = raw
    .split("\n")
    .filter((l) => l.startsWith("data:"))
    .map((l) => l.slice(5).trim())
    .filter(Boolean);
  if (dataLines.length === 0) {
    // Could be a plain JSON response (non-streaming) — try parsing directly.
    return JSON.parse(raw) as McpEnvelope;
  }
  return JSON.parse(dataLines[dataLines.length - 1]) as McpEnvelope;
}

/**
 * Galileo "meta-narration" prefixes: progress updates that are NOT findings.
 * When the stream contains only these, Galileo hasn't finished yet.
 */
const META_NARRATION_RE = /^(Watching Sessions?:|Building Metric:|Querying|Analyzing|Fetching|Loading|Investigating|Looking at)/i;

/**
 * Matches a LogRocket session URL like
 *   https://app.logrocket.com/<org>/<app>/s/6-<ULID>/0?t=...
 * The `/s/<sessionID>/<n>` segment is the load-bearing identifier.
 */
const SESSION_URL_RE = /\/s\/[A-Za-z0-9_-]+\/\d+/;

/**
 * Pulls a metric/chart ID out of a Galileo-cited URL. Galileo surfaces these
 * via `/metrics/<id>`, `/charts/<id>`, or `/m/<id>` (chart-builder links).
 */
function extractMetricIdFromUrl(url: string): string | null {
  const m = url.match(/\/(?:metrics|charts|m)\/([A-Za-z0-9_-]+)/);
  return m ? m[1] : null;
}

function extractTextAndLinks(envelope: McpEnvelope): {
  text: string;
  narration: string;
  links: string[];
  citedSessions: string[];
  metricIds: string[];
  messages: unknown[];
  /** True when at least one message with isTerminalMessage:true was found. */
  hasTerminal: boolean;
} {
  // The MCP returns content as an array of { type, text } items. The text
  // may be a JSON-encoded object (the structured result) OR plain prose.
  // Be tolerant of both shapes.
  const content = envelope.result?.content ?? [];
  const messages: unknown[] = [];
  const links: string[] = [];
  const citedSessions: string[] = [];
  const metricIds: string[] = [];

  // Galileo's actual shape (verified against MCP probe 2026-05-14):
  //   { type: "system", messageContent: "...prose...", toolType, messageID, isTerminalMessage }
  // We collect ALL inner messages but only surface the terminal one as `text`.
  let terminalText: string | null = null;
  const nonTerminalTexts: string[] = [];

  for (const item of content) {
    if (item.type !== "text" || typeof item.text !== "string") continue;
    let parsed: unknown = null;
    try {
      parsed = JSON.parse(item.text);
    } catch {
      // Plain text content (non-JSON) — treat as a terminal answer body since
      // it came directly from the MCP without the thinking-message wrapper.
      terminalText = (terminalText !== null ? terminalText + "\n\n" : "") + item.text;
      continue;
    }
    messages.push(parsed);
    const p = parsed as { messages?: unknown[]; text?: string; result?: { text?: string; messages?: unknown[] } };
    const innerMessages = p.messages ?? p.result?.messages;
    if (Array.isArray(innerMessages)) {
      for (const m of innerMessages) {
        const mm = m as {
          messageContent?: string;
          text?: string;
          content?: string;
          isTerminalMessage?: boolean;
          metricID?: string;
          metricId?: string;
        };
        // Explicit metric IDs on the message envelope take priority over URL parsing.
        const explicitMetricId = mm.metricID ?? mm.metricId;
        if (typeof explicitMetricId === "string" && !metricIds.includes(explicitMetricId)) {
          metricIds.push(explicitMetricId);
        }
        const body = mm.messageContent ?? mm.text ?? mm.content;
        if (!body) continue;
        if (mm.isTerminalMessage) {
          // Only the terminal message is the real answer — overwrite any earlier one.
          terminalText = body;
        } else {
          nonTerminalTexts.push(body);
        }
      }
    } else if (p.text) {
      // Top-level text without inner messages — treat as terminal if it's the
      // only signal we have.
      if (terminalText === null) terminalText = p.text;
    } else if (p.result?.text) {
      if (terminalText === null) terminalText = p.result.text;
    }
  }

  let text: string;
  let narration: string;
  let hasTerminal: boolean;

  // Narration is everything non-terminal Galileo emitted — including the
  // `Building Metric:` / `Watching Sessions:` lines. Callers in the
  // `completed_no_terminal` branch use this so they have something to cite.
  narration = nonTerminalTexts.join("\n\n");

  if (terminalText !== null) {
    // We have a definitive Galileo answer.
    text = terminalText;
    hasTerminal = true;
  } else {
    // No terminal message yet. Only surface non-meta-narration prose so we
    // don't mistake Galileo's progress narration for a real answer.
    const meaningful = nonTerminalTexts.filter((t) => !META_NARRATION_RE.test(t.trim()));
    text = meaningful.join("\n\n");
    hasTerminal = false;
  }

  // Galileo's contract: every URL in the answer must be surfaced. Pull URLs
  // from BOTH the terminal text (or filtered prose) and the narration, since
  // chart-only finishes carry the load-bearing URLs in the narration only.
  const linkRegex = /https?:\/\/[^\s)\]]+/g;
  const urlSources = [text, narration].filter(Boolean).join("\n");
  const found = urlSources.match(linkRegex) ?? [];
  for (const rawUrl of found) {
    // Trim common trailing punctuation that the broad regex absorbs.
    const url = rawUrl.replace(/[.,;:!?]+$/, "");
    if (!links.includes(url)) links.push(url);
    if (SESSION_URL_RE.test(url) && !citedSessions.includes(url)) {
      citedSessions.push(url);
    }
    const metricId = extractMetricIdFromUrl(url);
    if (metricId && !metricIds.includes(metricId)) {
      metricIds.push(metricId);
    }
  }

  return { text, narration, links, citedSessions, metricIds, messages, hasTerminal };
}

function extractChatId(envelope: McpEnvelope): string | undefined {
  // The chatID lives on the result envelope OR inside the JSON-encoded text
  // content. Check both places.
  const direct = envelope.result?.chatID;
  if (typeof direct === "string") return direct;
  const content = envelope.result?.content ?? [];
  for (const item of content) {
    if (item.type !== "text") continue;
    try {
      const parsed = JSON.parse(item.text) as { chatID?: string; result?: { chatID?: string } };
      if (parsed.chatID) return parsed.chatID;
      if (parsed.result?.chatID) return parsed.result.chatID;
    } catch {
      // ignore
    }
  }
  return undefined;
}

function extractStatus(envelope: McpEnvelope): "completed" | "thinking" | undefined {
  const direct = envelope.result?.status;
  if (direct === "completed" || direct === "thinking") return direct;
  const content = envelope.result?.content ?? [];
  for (const item of content) {
    if (item.type !== "text") continue;
    try {
      const parsed = JSON.parse(item.text) as { status?: string; result?: { status?: string } };
      const s = parsed.status ?? parsed.result?.status;
      if (s === "completed" || s === "thinking") return s;
    } catch {
      // ignore
    }
  }
  return undefined;
}

/**
 * Ask Galileo a question and wait for the completed answer. Returns the
 * verbatim text, the full link set, structured `citedSessions` / `metricIds`,
 * and the message stream — preserve all five when journaling to BigQuery.
 *
 * The caller does not modify, paraphrase, or filter Galileo's output. The
 * agent layer adds business framing ("revenue impact + ownership"); it
 * does NOT edit Galileo's narrative or its links.
 *
 * ## Status semantics (UNC-1383)
 *
 * - `"completed"` — Galileo emitted `isTerminalMessage: true`. `text` is the
 *   verbatim answer. Disposition normally.
 * - `"completed_no_terminal"` — Outer MCP status flipped to `completed` but
 *   no terminal message was ever sent. Galileo answered via the chart-builder
 *   tool path. `text` carries the meta-narration (`Building Metric:` /
 *   `Watching Sessions:` lines) so the caller has something to cite; the
 *   load-bearing disposition signal is on `citedSessions` and `metricIds`.
 *   Layer 3 LogRocket dispositioners can close on
 *   `citedSessions.length === 0` (or all-pre-fix ULIDs) without scraping
 *   chart URLs out of the narration. See
 *   `feedback_logrocket_fix_verification.md`.
 * - `"thinking"` — Poll cap hit (`MAX_POLLS * POLL_INTERVAL_MS` = 10 min) or
 *   the stream never finished. `text` is empty. Do NOT treat as a finding.
 * - `"error"` — Transport / RPC error from the MCP.
 */
export async function askGalileo(query: string, opts?: { promptVersion?: string }): Promise<GalileoResult> {
  const started = Date.now();
  const rawMessages: unknown[] = [];
  const linksBuf: string[] = [];
  const citedSessionsBuf: string[] = [];
  const metricIdsBuf: string[] = [];
  const narrationBuf: string[] = [];
  // Only keep the terminal answer text — never accumulate meta-narration.
  let terminalText: string | null = null;

  const pushExtracted = (e: ReturnType<typeof extractTextAndLinks>) => {
    rawMessages.push(...e.messages);
    if (e.hasTerminal) terminalText = e.text;
    if (e.narration) narrationBuf.push(e.narration);
    for (const l of e.links) if (!linksBuf.includes(l)) linksBuf.push(l);
    for (const s of e.citedSessions) if (!citedSessionsBuf.includes(s)) citedSessionsBuf.push(s);
    for (const m of e.metricIds) if (!metricIdsBuf.includes(m)) metricIdsBuf.push(m);
  };

  const initial = await mcpCall("tools/call", {
    name: "use_logrocket",
    arguments: { query } satisfies McpToolCallParams,
  });
  if (initial.error) {
    return {
      status: "error",
      text: `Galileo MCP error ${initial.error.code}: ${initial.error.message}`,
      links: [],
      citedSessions: [],
      metricIds: [],
      rawMessages: [initial],
      durationMs: Date.now() - started,
      promptVersion: opts?.promptVersion,
    };
  }
  pushExtracted(extractTextAndLinks(initial));

  let chatID = extractChatId(initial);
  let status = extractStatus(initial) ?? "completed";

  let polls = 0;
  while (status === "thinking" && chatID && polls < MAX_POLLS) {
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
    polls += 1;
    const next = await mcpCall(
      "tools/call",
      { name: "use_logrocket", arguments: { query, chatID, pollForResult: true } satisfies McpToolCallParams },
      polls + 1
    );
    if (next.error) {
      return {
        status: "error",
        text: terminalText ?? `[poll error ${next.error.code}: ${next.error.message}]`,
        links: linksBuf,
        citedSessions: citedSessionsBuf,
        metricIds: metricIdsBuf,
        chatID,
        rawMessages: [...rawMessages, next],
        durationMs: Date.now() - started,
        promptVersion: opts?.promptVersion,
      };
    }
    pushExtracted(extractTextAndLinks(next));
    status = extractStatus(next) ?? status;
    const nextChat = extractChatId(next);
    if (nextChat) chatID = nextChat;
  }

  // Three-way resolution (UNC-1383):
  //   - terminal message present       → "completed" with verbatim text
  //   - no terminal, outer status done  → "completed_no_terminal" with narration
  //     (Galileo answered via chart-builder; cited sessions + metric IDs are
  //     the load-bearing signal — see citedSessions / metricIds fields)
  //   - still in "thinking" (poll cap)  → "thinking" with empty text
  let resolvedStatus: GalileoResult["status"];
  let resolvedText: string;
  if (terminalText !== null) {
    resolvedStatus = "completed";
    resolvedText = (terminalText as string).trim();
  } else if (status === "completed") {
    resolvedStatus = "completed_no_terminal";
    resolvedText = narrationBuf.join("\n\n").trim();
  } else {
    resolvedStatus = "thinking";
    resolvedText = "";
  }

  return {
    status: resolvedStatus,
    text: resolvedText,
    links: linksBuf,
    citedSessions: citedSessionsBuf,
    metricIds: metricIdsBuf,
    chatID,
    rawMessages,
    durationMs: Date.now() - started,
    promptVersion: opts?.promptVersion,
  };
}
