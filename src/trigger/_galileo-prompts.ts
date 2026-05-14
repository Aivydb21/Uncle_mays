/**
 * Versioned prompt library for Galileo AI queries.
 *
 * The prompt text is what Galileo actually reads — we version it so we can
 * iterate on phrasing without redeploying every task, and so the BigQuery
 * journal can attribute Galileo's answer to the exact prompt that produced
 * it. Bump the version (e.g. v1 → v2) when changing wording; do NOT mutate
 * a prompt under an existing version.
 *
 * Galileo is the source of truth on user behavior. Agents consuming these
 * answers add business framing only — they do not edit or paraphrase
 * Galileo's narrative.
 */

export interface GalileoPrompt {
  id: string;
  version: string;
  text: string;
}

function p(id: string, version: string, text: string): GalileoPrompt {
  return { id, version, text };
}

export const DAILY_BRIEFING_PROMPTS: GalileoPrompt[] = [
  p(
    "daily.top_friction",
    "v1",
    "What were the top 5 friction patterns on unclemays.com in the last 24 hours? For each, include the affected user count, severity, and a representative session URL. Group similar issues together using your standard taxonomy."
  ),
  p(
    "daily.behavior_change",
    "v1",
    "What changed in user behavior on unclemays.com over the last 24 hours compared to the trailing 7-day baseline? Call out anything materially different in funnel progression, frustration signals, drop-off pages, or device/browser mix."
  ),
  p(
    "daily.top_recommendation",
    "v1",
    "Based on the last 24 hours of sessions on unclemays.com, what is the single highest-impact issue you would recommend the team fix today? Name the issue, who is affected, and the specific change you would make. Include the most representative session URLs."
  ),
];

export const WEEKLY_NARRATIVE_PROMPTS: GalileoPrompt[] = [
  p(
    "weekly.story",
    "v1",
    "Summarize the past 7 days of user experience on unclemays.com in 5 paragraphs. What worked, what failed, who was affected, and what materially changed vs the prior week. Be specific. Cite session URLs."
  ),
  p(
    "weekly.experiments",
    "v1",
    "Based on the last 7 days of session data, what three experiments would you prioritize next week for unclemays.com? Format each as: hypothesis, target metric, expected effect size, success criterion. Cite the supporting sessions."
  ),
  p(
    "weekly.active_experiments",
    "v1",
    "Which active experiments on unclemays.com (look for variant tags or A/B test events in the last 7 days) showed signal worth acting on? Quantify the difference between arms and cite representative sessions for each arm."
  ),
];

export const INCIDENT_PROMPT: GalileoPrompt = p(
  "incident.diagnose",
  "v1",
  "An incident has just been detected on unclemays.com. Diagnose: what is causing this, who is affected, what should be remediated, and how urgent is the fix? Cite the strongest representative session URLs."
);

/**
 * Look up a prompt by id at runtime. Used by `galileo-on-demand.ts` so an
 * agent can request "the daily.top_friction prompt" without hard-coding the
 * string, keeping the journal entry attributable.
 */
export function findPrompt(id: string): GalileoPrompt | undefined {
  const all = [...DAILY_BRIEFING_PROMPTS, ...WEEKLY_NARRATIVE_PROMPTS, INCIDENT_PROMPT];
  return all.find((x) => x.id === id);
}
