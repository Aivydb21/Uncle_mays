// Smoke for UNC-1383. Run with:
//   node --experimental-strip-types --no-warnings scripts/unc-1383-smoke.mjs
// Verifies the completed_no_terminal branch, citedSessions, and metricIds.
process.env.LOGROCKET_PAT = "pat:t:t:t";
process.env.LOGROCKET_MCP_URL = "https://mcp.logrocket.test/mcp";

const { askGalileo } = await import("../src/lib/galileo.ts");

function makeFetchEnvelope(messages, status, chatID = "c1") {
  const payload = { status, chatID, messages };
  const body = `data: ${JSON.stringify({ result: { content: [{ type: "text", text: JSON.stringify(payload) }] } })}\n\n`;
  return () => Promise.resolve({ ok: true, text: () => Promise.resolve(body) });
}

let pass = 0, fail = 0;
const check = (name, cond, extra) => {
  if (cond) { pass++; console.log(`  PASS  ${name}`); }
  else { fail++; console.log(`  FAIL  ${name}${extra ? "  — " + JSON.stringify(extra) : ""}`); }
};

// Case A: completed_no_terminal
{
  globalThis.fetch = makeFetchEnvelope([
    { messageContent: "Building Metric: drop_off_after_cart\nhttps://app.logrocket.com/o/a/charts/met_abc123", isTerminalMessage: false },
    { messageContent: "Watching Sessions:\n- https://app.logrocket.com/o/a/s/6-019e3f4a-08c2-77df-a6ad-d1bc9009c566/0\n- https://app.logrocket.com/o/a/s/6-019e3d24-2783-7b02-82c9-66d34ce24918/0", isTerminalMessage: false },
  ], "completed");
  const r = await askGalileo("?");
  console.log("Case A: completed_no_terminal");
  check("status is completed_no_terminal", r.status === "completed_no_terminal", { got: r.status });
  check("text non-empty (narration)", r.text.length > 0);
  check("citedSessions has 2 URLs", r.citedSessions.length === 2, r.citedSessions);
  check("metricIds includes met_abc123", r.metricIds.includes("met_abc123"), r.metricIds);
}

// Case B: completed with terminal
{
  globalThis.fetch = makeFetchEnvelope([
    { messageContent: "Watching Sessions: ...", isTerminalMessage: false },
    { messageContent: "Final: 72% exit at payment.", isTerminalMessage: true },
  ], "completed");
  const r = await askGalileo("?");
  console.log("Case B: completed (terminal present)");
  check("status is completed", r.status === "completed", { got: r.status });
  check("text equals terminal", r.text === "Final: 72% exit at payment.", { got: r.text });
}

// Case C: still thinking — must NOT become completed_no_terminal
{
  globalThis.fetch = makeFetchEnvelope([
    { messageContent: "Watching Sessions: still analyzing...", isTerminalMessage: false },
  ], "thinking");
  globalThis.setTimeout = (fn) => { fn(); return 0; };
  const r = await askGalileo("?");
  console.log("Case C: thinking (poll cap)");
  check("status is thinking", r.status === "thinking", { got: r.status });
  check("text is empty", r.text === "", { got: r.text });
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
