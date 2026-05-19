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
  status: "completed" | "thinking" | "error";
  text: string;                  // Galileo's verbatim answer (latest message text)
  links: string[];               // Every link Galileo cited — preserve all (per MCP contract)
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

function extractTextAndLinks(envelope: McpEnvelope): {
  text: string;
  links: string[];
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
        };
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
  let hasTerminal: boolean;

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

  // Galileo's contract: every URL in the answer must be surfaced. Extract
  // anything that looks like a LogRocket link out of the final text.
  const linkRegex = /https?:\/\/[^\s)\]]+/g;
  const found = text.match(linkRegex) ?? [];
  for (const url of found) if (!links.includes(url)) links.push(url);

  return { text, links, messages, hasTerminal };
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
 * verbatim text, the full link set, and the message stream — preserve all
 * three when journaling to BigQuery.
 *
 * The caller does not modify, paraphrase, or filter Galileo's output. The
 * agent layer adds business framing ("revenue impact + ownership"); it
 * does NOT edit Galileo's narrative or its links.
 */
export async function askGalileo(query: string, opts?: { promptVersion?: string }): Promise<GalileoResult> {
  const started = Date.now();
  const rawMessages: unknown[] = [];
  const linksBuf: string[] = [];
  // Only keep the terminal answer text — never accumulate meta-narration.
  let terminalText: string | null = null;

  const initial = await mcpCall("tools/call", {
    name: "use_logrocket",
    arguments: { query } satisfies McpToolCallParams,
  });
  if (initial.error) {
    return {
      status: "error",
      text: `Galileo MCP error ${initial.error.code}: ${initial.error.message}`,
      links: [],
      rawMessages: [initial],
      durationMs: Date.now() - started,
      promptVersion: opts?.promptVersion,
    };
  }
  const first = extractTextAndLinks(initial);
  rawMessages.push(...first.messages);
  if (first.hasTerminal) terminalText = first.text;
  for (const l of first.links) if (!linksBuf.includes(l)) linksBuf.push(l);

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
        chatID,
        rawMessages: [...rawMessages, next],
        durationMs: Date.now() - started,
        promptVersion: opts?.promptVersion,
      };
    }
    const step = extractTextAndLinks(next);
    rawMessages.push(...step.messages);
    // Only overwrite the answer when a terminal message is present.
    if (step.hasTerminal) terminalText = step.text;
    for (const l of step.links) if (!linksBuf.includes(l)) linksBuf.push(l);
    status = extractStatus(next) ?? status;
    const nextChat = extractChatId(next);
    if (nextChat) chatID = nextChat;
  }

  // If status is still "thinking" after the poll cap — or if we never received
  // a terminal message even though the outer status says "completed" — mark the
  // result as "thinking" so callers know the answer is incomplete.
  const resolvedStatus: GalileoResult["status"] =
    terminalText !== null ? "completed" : "thinking";

  return {
    status: resolvedStatus,
    text: terminalText?.trim() ?? "",
    links: linksBuf,
    chatID,
    rawMessages,
    durationMs: Date.now() - started,
    promptVersion: opts?.promptVersion,
  };
}
