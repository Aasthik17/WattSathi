# Master build prompt — WattSathi

You are the senior full-stack engineer and product designer responsible for implementing WattSathi from this repository's specifications. Read `AGENTS.md` first and follow it throughout the task.

## Mission

Build a polished, working MVP of **WattSathi**, a voice-first AI field engineer for rooftop-solar maintenance technicians. The app must use **Bolna AI** for the actual voice conversation. A technician should be able to speak in Hindi/Hinglish, get concise troubleshooting guidance grounded in the exact uploaded manual/SOP, and create a structured work order only after confirming the summary.

This is a hackathon prototype, so prioritize one excellent end-to-end workflow over broad, incomplete feature coverage.

## Required deliverables

1. A premium, responsive web dashboard with overview, sites/assets, knowledge documents, live voice session, call history and work orders.
2. FastAPI backend with a relational database, migrations and typed API.
3. Document ingestion (PDF, DOCX, TXT, MD), source-aware chunking and retrieval. For the MVP, use PostgreSQL full-text search or a similarly low-cost explainable retrieval method. Do not require a paid embeddings API.
4. Bolna integration: create/configure or reuse an agent, connect the current official Bolna-supported voice channel, expose secured custom functions for manual search and work-order creation, ingest call webhooks, and display call details/transcript/extraction fields when available.
5. Hindi/Hinglish-first conversation prompt and conservative safety policy from `docs/VOICE_AGENT_PROMPT.md` and `docs/SAFETY_POLICY.md`.
6. A clearly-labelled fictional demo manual and demo asset so the app can be demonstrated before a real vendor supplies documentation.
7. Tests, `.env.example`, Docker Compose, local run instructions and deployment notes.

## Mandatory Bolna integration workflow

Before writing Bolna API code:

- Install/read Bolna's official skills if possible: `npx skills add bolna-ai/skills -a codex` (for Codex) or the available equivalent for the current agent.
- If Codex is used, optionally connect `https://mcp.bolna.ai/api/mcp` using `BOLNA_API_KEY` as described in `START_HERE.md`.
- Read the live official docs and the current skill instructions for agent creation, knowledge bases, function tools, web calls, webhooks and executions.
- Use the official current API schemas. Do not copy stale examples from blog posts or assume older endpoint fields remain valid.
- Prefer browser/Web Call SDK for the demo if available to this account and supported by current docs. If not, implement an explicitly initiated outbound test call or a phone/inbound path that the account can actually support. Do not buy a phone number or start an outbound call without user confirmation.
- Make the integration resilient: timeouts, retries only for idempotent reads, structured errors, redacted logs and idempotent webhook handling.

## Suggested implementation sequence

### Phase 0 — inspect and plan

Inspect the repo, confirm runtime versions, check the current Bolna docs and skills, then write a concise implementation checklist. Do not ask the user routine questions; use documented defaults. Ask only if a real secret/account choice is required.

### Phase 1 — app skeleton

Create the frontend/backend structure, health endpoint, database connection, migrations, environment validation and docker compose. Verify both apps start.

### Phase 2 — product UI and demo data

Implement the responsive dashboard with an operations-focused visual system. Use graphite/neutral surfaces, a restrained solar-amber accent, clear status colors, readable typography and no generic purple AI gradients. Create seed command for one fictional demo site, inverter and demo manual. Clearly label demo records as simulated.

### Phase 3 — knowledge ingestion

Implement secure document upload, file-type/size validation, text extraction, chunking, persistence and source-grounded search. Store original filename, page/section metadata and chunk references. Search results must include source title, page/section and relevant excerpt. Never return content from a document belonging to another tenant/site.

### Phase 4 — Bolna voice agent

Create/reuse a Bolna agent using the official skills/docs. Configure Hindi and Hinglish-appropriate handling; prefer Sarvam Saaras v4 for Hindi/Hinglish STT and a supported Hindi/code-mixed TTS voice such as Sarvam Bulbul v4 Flash or Kalpa, but check current account availability and bundled pricing before choosing. Use a fast, low-cost LLM included in the current Bolna bundle when possible. Do not enable premium models that incur extra usage without approval.

Build the actual voice experience. Use the supported browser/Web Call SDK if feasible. Otherwise provide a controlled test-call action that requires a phone number, an explicit confirmation checkbox and a cost notice. Never auto-dial.

### Phase 5 — custom function tools

Expose only the minimum tools needed:

- `search_manual`: query the approved docs for the selected asset, return at most 3–5 short relevant excerpts with source metadata, and state when no reliable match exists.
- `create_work_order`: accept a validated, confirmed issue summary and observations; reject requests missing explicit confirmation, site/asset identity or caller/technician context.
- Optional `get_asset_context`: retrieve an asset's model, site and allowed maintenance history.

Follow Bolna's current custom HTTP function tool schema. Authenticate requests, rate-limit, validate inputs and audit tool calls. Use the user's app/site context, not a model-generated arbitrary asset ID.

### Phase 6 — webhooks and call records

Configure a Bolna webhook using the current supported configuration. Handle call started/updated/completed/failed events only as documented. Persist execution ID, agent ID, call status, timestamps, duration, cost if returned, recording URL if present, transcript/summary/extractions if present, and safe error details. Protect webhook endpoint, deduplicate by event/execution identifier, and tolerate retries/out-of-order delivery.

### Phase 7 — QA and polish

Run backend tests, frontend lint/typecheck, build, migration checks and a browser smoke test. Mock Bolna in automated tests. Test one live call manually only after the user chooses to spend the $5 credit. Fix all blocking issues.

### Phase 8 — deploy and rehearse

Write exact env var and deployment instructions. Verify frontend-to-backend CORS, webhook public URL, database migrations, secret storage and production build. Prepare a 90–120 second demo following `docs/DEMO_SCRIPT.md`.

## Required UX

The primary dashboard should make these items visible immediately:

- Active sites and assets.
- Recent calls and their status.
- Open work orders and escalation status.
- Knowledge-base document coverage.
- A prominent **Talk to WattSathi** action.

The voice workspace should show call state (connecting/listening/thinking/speaking/ended), selected site/asset, recent conversation turns if the SDK exposes them, and a clear end-call control. Do not fake live transcription if the SDK does not expose it; use actual Bolna execution data after the call.

## Required guardrails

- No electrical repair instructions beyond safe, non-invasive observations explicitly grounded in approved documentation.
- Any smoke, fire, burning smell, electric shock, exposed conductor, water ingress near electrical equipment, repeated breaker trip, damaged cable, or uncertainty: tell the caller to stop, move away, avoid touching equipment and contact the site's qualified/electrical emergency contact. Do not attempt diagnosis over the call.
- Never tell an unqualified caller to open equipment or measure live circuits.
- Ask one question at a time and keep spoken replies to 1–3 short sentences.
- Clearly separate source-backed facts from hypotheses.
- A work order must be read back and explicitly confirmed before creation.

## Acceptance criteria

- The app runs locally from documented commands.
- An admin can upload a document and see ingestion status.
- A manual search returns excerpts with source/page metadata.
- A real Bolna agent is configured and a manually initiated test voice session is possible through the chosen supported channel (or the precise account-side blocker is documented).
- The agent can call the manual-search backend tool and receives grounded excerpts.
- The agent can create a work order only after verbal confirmation.
- The work order appears in the dashboard and is linked to the call/execution where possible.
- Bolna webhook events are validated, persisted and idempotent.
- Automated tests never spend Bolna credits.
- `.env` and secrets are not in git history.

## Final response to the user

When implementation is complete, provide: what works, exact local run commands, exact Bolna dashboard steps still requiring human action, which environment variables must be added, deployment URLs/steps, test results, known limitations and the one safest first live-call procedure. Be honest about anything not verified.
