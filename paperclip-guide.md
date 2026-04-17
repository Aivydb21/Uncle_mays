# Paperclip Guide for Uncle May's Produce

> Your 5-agent AI executive team: CEO, CMO, COO, Investor Relations, CTO
> Dashboard: http://localhost:3100
> Last updated: 2026-04-07

---

## Quick Reference

### Starting Paperclip
```bash
node C:\Users\Anthony\Desktop\business\start-paperclip.cjs
```
Then open http://localhost:3100

> The startup script handles migration fixes automatically before launching.
> Do NOT use `npx paperclipai run` directly — it will crash if the DB has
> migrations that conflict with existing schema objects.

### Your Agents

| Agent | Role | What They Do |
|-------|------|-------------|
| **CEO** | Orchestrator | Breaks goals into tasks, delegates to others, monitors progress |
| **CMO** | Marketing | Brand, social media, content calendar, customer acquisition |
| **COO** | Operations | Store ops, supply chain, vendor management, SOPs |
| **Investor Relations** | Fundraising | Investor research, outreach drafts, pipeline management, CRM |
| **CTO** | Technology | Data platform, website, POS systems, analytics infrastructure |

---

## Part 1: The Dashboard

When you open http://localhost:3100, you'll see:

**Left sidebar navigation:**
- **Dashboard** — Real-time overview: agent statuses, task counts, spend vs budget, recent activity
- **Org Chart** — Your 5 agents with live status indicators (running/idle/paused/error)
- **Tasks** — Kanban board and list view of all tasks across agents
- **Projects** — Group related tasks into projects
- **Approvals** — Items waiting for your sign-off (strategy proposals, hire requests)
- **Costs** — Spend by agent, project, and company level
- **Activity** — Chronological audit log of everything every agent has done

**Check daily:**
1. Dashboard for blocked tasks and budget utilization
2. Approvals queue (pending approvals are the #1 reason agents stall)
3. Any agents in "error" state

---

## Part 2: How to Give Agents Work

### Method 1: Set Goals and Let CEO Delegate (Recommended)

This is the highest-leverage approach. You set the strategic direction, the CEO breaks it down.

**Step 1: Create company goals**

In the UI, go to Settings > Goals and create your top-level goals:

| Goal | Why It Matters |
|------|---------------|
| Close $400K+ SAFE round by Q2 2026 | Triggers SBA facility, funds store build-out |
| Launch Hyde Park flagship store | Proves the model, generates revenue and data |
| Build data collection infrastructure | Enables the high-margin data/platform revenue layers |
| Establish brand presence in target communities | Drives foot traffic and investor confidence |

**Step 2: Create a high-level task for the CEO**

Go to Tasks > New Issue:
- **Title:** "Break Q2 goals into weekly execution plan and delegate to team"
- **Description:** Include the goals, current status, and constraints
- **Assign to:** CEO
- **Priority:** High

**Step 3: The CEO wakes up and works**

When you assign the task, the CEO agent wakes up (heartbeat fires), reads the task, and:
1. Breaks it into subtasks
2. Assigns subtasks to CMO, COO, IR, CTO
3. Those agents wake up when they receive assignments
4. They execute and update task status

**Step 4: You review and approve**

Check the Approvals queue. The CEO may propose strategies that need your sign-off. Approve, reject, or request revisions.

### Method 2: Assign Tasks Directly to Specific Agents

For targeted work, skip the CEO and go straight to the agent:

**Examples for each agent:**

**Investor Relations:**
- "Research Manna Tree Partners: scrape their website for thesis, portfolio companies, check size. Summarize fit with Uncle May's."
- "Draft 5 personalized investor emails for the top-scoring Tier 1 contacts this week"
- "Update investor-crm.md with all pipeline activity from the past 7 days"

**CMO:**
- "Draft 2 LinkedIn posts for this week: one on Black consumer data insights, one on the Hyde Park flagship progress"
- "Create a content calendar for April 2026 covering LinkedIn, Instagram, and newsletter"
- "Analyze our top 3 competitors in the Hyde Park grocery market and identify positioning gaps"

**COO:**
- "Create the opening-day operations playbook for the Hyde Park store"
- "Build a vendor onboarding checklist for culturally specific product suppliers"
- "Draft the staffing model for a 10,000 sq ft neighborhood grocery store"

**CTO:**
- "Evaluate POS systems for a neighborhood grocery format: compare Square, Lightspeed, and NCR"
- "Design the data schema for capturing customer purchase behavior at the store level"
- "Create a technical architecture document for the data platform that investors can review"

### Method 3: Manual Heartbeat Invoke

Click the "Invoke" button on any agent's detail page to wake them up immediately, even without a new task. Useful when you want an agent to check on their existing work.

---

## Part 3: How Agents Work (Heartbeats)

Agents don't run continuously. They wake up in short bursts called **heartbeats**.

### What Triggers a Heartbeat

| Trigger | What Happens |
|---------|-------------|
| **Task assigned** | Agent wakes to work on the new task |
| **Schedule timer** | Agent wakes on a recurring interval (e.g., every hour) |
| **@mention in comment** | Someone writes @CEO in a task comment, CEO wakes up |
| **You click "Invoke"** | Manual wake from the dashboard |
| **Blocker resolved** | All blocking tasks are done, agent wakes to continue |
| **Approval resolved** | You approve/reject something the agent requested |

### What Happens Each Heartbeat

1. Agent wakes up and checks: "Who am I? What are my tasks?"
2. Agent checks out (claims) one task to work on
3. Agent does the work (research, writing, creating subtasks, etc.)
4. Agent updates the task status and adds comments
5. Agent goes back to sleep until next trigger

### Configuring Heartbeat Schedules

For each agent, you can set a recurring timer in the agent's adapter config:

**Recommended schedules for Uncle May's (updated 2026-04-09):**

| Agent | Interval | intervalSec | Why |
|-------|----------|-------------|-----|
| CEO | Every 12 hours | 43200 | 2x/day; still wakes on-demand for task assignments |
| CMO | Every 12 hours | 43200 | Product/content work batches well |
| COO | Every 12 hours | 43200 | Operations planning is methodical |
| IR | Every 12 hours | 43200 | Wakes on-demand for replies; scheduled checks 2x/day |
| CTO | Every 12 hours | 43200 | Technical work batches well |
| CRO | Every 12 hours | 43200 | Revenue monitoring 2x/day is sufficient |
| CFO | Every 12 hours | 43200 | Financial monitoring is not time-critical |
| CIO | Every 12 hours | 43200 | Infrastructure checks 2x/day |
| RevOps | Every 12 hours | 43200 | Data/analytics 2x/day |

**Important:** All agents have `wakeOnDemand: true`, so they still respond immediately to task assignments and @mentions. The interval only controls the scheduled monitoring heartbeat.

Set these in the UI: Agent Detail > Configuration > Heartbeat Settings.
Or run: `bash scripts/fix-heartbeat-intervals.sh`

---

## Part 4: How Agents Talk to Each Other

Agents communicate through the **task system**, not direct messages:

1. **Delegation:** CEO creates a subtask and assigns it to CMO. CMO wakes up and sees the task.
2. **Status updates:** Agents add comments to tasks. "Completed the competitor analysis. Key finding: no grocery store in Hyde Park stocks more than 40% culturally specific products."
3. **@mentions:** CMO writes "@CTO can you set up tracking for the landing page?" in a task comment. CTO wakes up.
4. **Escalation:** If an agent is stuck, they comment on the parent task or reassign to their manager.
5. **Blockers:** Agent marks a task as "blocked by [other task]." When the blocker is done, the agent auto-wakes.

**The chain of command matters.** Every agent knows who they report to and who reports to them. The CEO sees everything. Other agents see their own work and their reports' work.

---

## Part 5: Budget Management

### Setting Budgets

Budgets control how much each agent can spend on AI model calls per month.

**Set company budget:**
Dashboard > Settings > Budget > Set monthly limit

**Set per-agent budgets:**
Agent Detail > Configuration > Budget

**Recommended starting budgets for Uncle May's:**

| Agent | Monthly Budget | Rationale |
|-------|---------------|-----------|
| CEO | $60 | Highest: plans, delegates, reviews all work |
| IR | $50 | High: investor research and email drafting |
| CMO | $40 | Medium: content creation and strategy |
| COO | $30 | Medium: operations planning |
| CTO | $40 | Medium: technical architecture and research |
| **Company total** | **$250** | Covers all 5 agents with headroom |

### How Budget Enforcement Works

| Spend Level | What Happens |
|------------|-------------|
| 0-79% | Normal operation |
| 80% | Agent gets a soft warning, focuses on critical tasks only |
| 100% | **Hard stop.** Agent is auto-paused. No more heartbeats fire. |

To unpause: increase the budget, or wait for the next calendar month (resets on the 1st).

### Monitoring Spend

- **Dashboard:** Real-time spend vs budget for each agent
- **Costs page:** Detailed breakdown by agent, task, and project
- Check daily to catch unexpected spikes early

---

## Part 6: Projects — Organizing Work

Projects group related tasks toward a deliverable. Create projects for Uncle May's major workstreams:

### Recommended Projects

| Project | Lead Agent | Goals |
|---------|-----------|-------|
| **SAFE Round Close** | IR | Close $400K-$750K, all investor outreach and diligence |
| **Hyde Park Store Launch** | COO | Build-out, staffing, vendor onboarding, opening day |
| **Brand & Marketing** | CMO | Brand voice, social presence, content calendar, CAC |
| **Data Platform MVP** | CTO | POS selection, data schema, analytics pipeline |
| **Investor Communications** | IR + CMO | Newsletter, stakeholder updates, investor updates |

Create projects in the UI: Projects > New Project. Set a lead agent and link to company goals.

---

## Part 7: Your Daily Workflow with Paperclip

### Morning (5 minutes)

1. Open http://localhost:3100
2. **Dashboard:** Check agent statuses. Are any in "error" or "paused"?
3. **Approvals:** Approve or reject any pending items (don't let these pile up)
4. **Tasks:** Skim the Kanban board for blocked or stale tasks

### When You Have Strategic Input (10 minutes)

1. Create a new task with your direction
2. Assign to the right agent (or CEO if it needs delegation)
3. The agent wakes up automatically

### Weekly Review (15 minutes)

1. **Costs page:** Review spend by agent. Anyone burning too fast?
2. **Activity log:** Scan for unexpected patterns
3. **Tasks:** How many moved from todo to done this week?
4. **Goals:** Are we on track for Q2 targets?
5. Create any new tasks for the coming week

---

## Part 8: Practical Playbooks for Uncle May's Goals

### Playbook 1: Close the SAFE Round

**Goal:** Raise $400K-$750K to trigger SBA facility close

**Tasks to create:**

1. Assign to **IR:** "Research the top 20 Tier 1 investors using Firecrawl. For each fund, scrape their website and summarize: thesis, portfolio companies in food/retail/data, typical check size, stage preference. Output a ranked list with personalization hooks for each."

2. Assign to **IR:** "Draft personalized outreach emails for the top 10 investors from the research. Follow email style rules: no em dashes, max 2 paragraphs, investor-to-investor tone, include phone number and teaser note."

3. Assign to **CTO:** "Create a one-page technical architecture summary of the data platform for investor diligence. Include: data collection points, storage, analytics pipeline, monetization API design, privacy approach."

4. Assign to **CMO:** "Draft a 'Why Now' narrative section (2-3 paragraphs) for investor communications. Focus on: $100B+ TAM, 97% intent-to-shop data, the structural market gap, and Uncle May's platform positioning."

5. Assign to **CEO:** "Review all investor materials from IR, CTO, and CMO. Ensure consistency in narrative, numbers, and positioning. Create a master diligence checklist."

### Playbook 2: Prepare for Store Launch

**Goal:** Ready the Hyde Park flagship for opening

**Tasks to create:**

1. Assign to **COO:** "Create a 90-day pre-opening operations timeline for the Hyde Park store. Include: build-out milestones, equipment procurement, vendor onboarding, staff hiring, training, soft opening, grand opening. Reference the $1,460K build-out budget and $250K initial inventory."

2. Assign to **COO:** "Build the vendor onboarding playbook. Focus on culturally specific product suppliers. Include: sourcing criteria, margin targets (30-45% distribution margin), ordering processes, payment terms, quality standards."

3. Assign to **COO:** "Draft the staffing model for a 10,000 sq ft neighborhood grocery store. Include: positions needed, FTE count, labor cost as % of revenue, scheduling approach, training program outline."

4. Assign to **CTO:** "Evaluate and recommend a POS system for the flagship store. Requirements: inventory management, customer data capture, loyalty program support, vendor management, reporting/analytics. Compare 3 options with pricing."

5. Assign to **CMO:** "Create the grand opening marketing plan. Include: pre-launch buzz (social, local press, community events), opening week promotions, ongoing customer acquisition strategy. Target: Black women, ages 25-35, Hyde Park and surrounding neighborhoods."

### Playbook 3: Build the Brand

**Goal:** Establish Uncle May's as the brand for culturally specific grocery

**Tasks to create:**

1. Assign to **CMO:** "Create a 30-day social media content calendar. Platforms: LinkedIn (2x/week, investor + industry audience) and Instagram (3x/week, consumer audience). Themes: food culture, community, behind-the-scenes, data insights. No team/location reveals in public posts."

2. Assign to **CMO:** "Analyze 5 competitor grocery brands that serve Black communities (nationally). Use Firecrawl to scrape their websites and social media. Identify: positioning, product focus, pricing strategy, community engagement approach. Summarize gaps Uncle May's can exploit."

3. Assign to **CMO:** "Draft the next stakeholder newsletter. Focus on: recent progress (SBA secured, location LOI, team hires), one market insight (Black consumer shopping behavior data), one ask (introductions to grocery/food retail operators)."

---

## Part 9: Correcting Course — Changing Agent Direction

If you don't like what an agent is doing, you have several options from lightest to heaviest:

### Option 1: Comment on the Task (Lightest)
Go to the task in the UI, add a comment with your feedback:
> "This isn't the right angle. Focus on the data platform positioning, not the retail grocery narrative. Investors care about the 60-70% margin data layer, not the 20-30% retail margin."

The agent will read your comment on its next heartbeat and adjust.

### Option 2: Update Task Description
Edit the task directly to be more precise about what you want. The agent reads the task description each time it wakes up.

### Option 3: Pause and Redirect
1. Click "Pause" on the agent in the dashboard — stops all heartbeats
2. Cancel or reassign the task that was going wrong
3. Create a new task with clearer direction
4. Resume the agent

### Option 4: Edit the Agent's SOUL.md (Most Impactful)
If the agent's overall approach is wrong (not just one task), update their persona:

```
~/.paperclip/instances/default/companies/<companyId>/agents/<agentId>/instructions/SOUL.md
```

Changes take effect on the next heartbeat. For example, if the IR agent is writing emails that are too formal, add to SOUL.md:
> "Write like a peer sending a quick note, not like a banker sending a memo. Shorter sentences. More conversational."

### Option 5: Edit HEARTBEAT.md (Change Priorities)
If the agent's work priorities are wrong, update their heartbeat checklist. This changes what they focus on every time they wake up.

### Option 6: Roll Back Config
Agent Detail > Config Revisions. If a recent change made things worse, roll back to a previous version with one click.

**Key principle:** Start with comments (lightweight, task-specific). Escalate to SOUL.md edits only if the pattern is systemic across multiple tasks.

---

## Part 10: Agent Configuration Files

Each agent has instruction files in:
```
~/.paperclip/instances/default/companies/<companyId>/agents/<agentId>/instructions/
```

| File | Purpose |
|------|---------|
| **SOUL.md** | Agent's persona, strategic posture, voice, and coordination rules |
| **AGENTS.md** | Agent's identity, title, reporting structure, skills list |
| **HEARTBEAT.md** | What to do each time the agent wakes up |
| **TOOLS.md** | Tools and capabilities available to the agent |

**To edit an agent's persona:** Update their SOUL.md file directly, or use the UI's agent configuration editor.

**Config revisions:** Every change is versioned. You can roll back to a previous config from the agent detail page if something goes wrong.

---

## Part 10: Skills and Capabilities

Skills are reusable instruction modules that give agents specific capabilities.

**Firecrawl skills** are already installed globally (`~/.agents/skills/firecrawl*`):
- `firecrawl-scrape` — Scrape a single web page
- `firecrawl-search` — Search the web
- `firecrawl-crawl` — Crawl an entire website
- `firecrawl-map` — Map a site's URL structure
- `firecrawl-download` — Download files from the web

**To add skills to a specific agent:**
Agent Detail > Skills > Assign skills from the available list

**The core Paperclip skill** is automatically included. It teaches agents the heartbeat protocol, API usage, task management, delegation patterns, and communication norms.

---

## Part 11: Troubleshooting

| Problem | Check |
|---------|-------|
| Agent not doing anything | Is it paused? Over budget? Any pending approvals blocking it? |
| CEO not delegating | Does it have goals to work from? Are heartbeats enabled? |
| Task stuck in "in_progress" | Check the agent's run history for errors. Check comments for blockers. |
| Unexpected costs | Costs page > filter by agent. Look for agents in loops. |
| Agent in "error" state | Agent Detail > Run History > click the failed run to see the transcript |
| Agents not communicating | Are tasks linked with parentId? Are @mentions being used in comments? |

### Restarting Paperclip

If the server crashes:
```bash
# Kill stale postgres
taskkill /F /IM postgres.exe 2>nul
# Remove stale PID if needed
del C:\Users\Anthony\.paperclip\instances\default\db\postmaster.pid 2>nul
# Wait a moment
timeout /t 5
# Restart
cd C:\Users\Anthony\Desktop\paperclip\server
npx tsx src/index.ts
```

---

## Part 12: Key Principles

1. **You are the board operator.** You set goals, approve strategies, and manage budgets. The agents execute.

2. **Don't micromanage.** Give the CEO a goal and let it delegate. Intervene only when things stall.

3. **Approvals are the bottleneck.** Check the approval queue daily. A pending approval means an agent is waiting on you.

4. **Start small, scale up.** Begin with 2-3 tasks per agent per week. Increase as you learn what works.

5. **Budget conservatively.** You can always increase. An agent that hits its budget cap stops working until next month.

6. **Every task should trace to a goal.** If you can't connect a task to closing the SAFE round, launching the store, or building the platform, question whether it should exist.

7. **Firecrawl before outreach.** The IR agent should always research a fund before drafting an email. Generic outreach wastes your pipeline.

8. **Anthony handles all investor replies personally.** Agents draft, research, and prepare. You close.
