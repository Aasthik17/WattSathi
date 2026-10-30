# AGENTS.md — WattSathi engineering rules

You are implementing a real product prototype. Do not stop after producing plans or mockups. Build, run, test and fix the application.

## Before coding

1. Read `README.md`, `docs/PRODUCT_REQUIREMENTS.md`, `docs/ARCHITECTURE.md`, `docs/BOLNA_INTEGRATION.md`, `docs/SAFETY_POLICY.md`, and `docs/IMPLEMENTATION_PLAN.md`.
2. Inspect the existing repository before changing files. Preserve useful existing work.
3. Use Bolna's official Agent Skills and MCP tools when available. Read the current official Bolna docs before creating or updating an agent, configuring custom tools, creating a knowledge base, configuring webhooks, or using the Web Call SDK. Do not guess request schemas.
4. Record the actual Bolna agent ID, supported call mode and verified configuration in `.env` / deployment secrets. Never commit secrets.

## Product invariants

- The primary product is a voice-first AI field engineer for solar O&M technicians, not a generic chatbot or CRM.
- Hindi/Hinglish is the first-class voice experience. Keep replies short, natural and interruptible.
- All troubleshooting must be grounded in uploaded, approved manufacturer manuals or company SOPs. Return source title and page/section when available.
- The fictional demo manual is for UI and flow testing only. Clearly label it as simulated. Never claim it is an actual manufacturer's document.
- Never invent equipment models, fault-code meanings, measured values, warranty status, service history or repair outcomes.
- If evidence is insufficient, say so and ask for the exact model/fault code or escalate to a qualified human.
- Never instruct a caller to open an inverter, remove an electrical cover, touch conductors, probe live AC/DC terminals, bypass a protection device, defeat grounding, or perform hazardous electrical work. Do not direct a user to disconnect/reconnect AC or DC wiring. Escalate dangerous or uncertain conditions.
- Do not declare a root cause as confirmed unless a qualified human has verified it. Use labels such as `suspected`, `unverified`, and `requires inspection`.
- Create a work order only after reading the summary back and receiving explicit confirmation from the caller.
- No automatic outbound calls, batch campaigns, number purchases or recurring calls. A human must deliberately initiate each paid test call.

## Security and cost

- Keep `BOLNA_API_KEY`, database credentials, JWT secret and tool shared secret server-side only.
- Never expose secrets in Next.js client bundles, browser storage, logs, API responses or source control.
- Protect the Bolna function-tool endpoints with the strongest authentication supported by the current Bolna tool configuration. Use a high-entropy shared secret and constant-time comparison if a shared-secret header is supported. If the platform's tool mechanism cannot securely authenticate the request, document the limitation and use a safe alternative; do not make destructive tools public.
- Validate webhook authenticity according to Bolna's current documentation. Make webhook processing idempotent and tolerate retries/out-of-order events.
- Unit tests must mock all Bolna calls. Never make live paid calls as part of `pytest`, Playwright or CI.
- Add an explicit manual confirmation and cost notice before any phone call is initiated.
- Keep demo call duration short and configure a conservative conversation stop condition. Do not claim this is a hard provider-side duration cap unless one is actually configured and verified.

## Engineering quality

- Prefer typed interfaces, clear module boundaries, input validation, structured logs and actionable errors.
- Use migrations for database schema changes.
- Do not write mock data into production tables on every startup. Seed demo fixtures only through an explicit development command.
- Do not silently swallow failures. Surface call, webhook, document-processing and tool errors in the dashboard.
- Add tests for normal, invalid, duplicate, timeout and unauthorized requests.
- Keep the interface responsive, keyboard accessible and usable on a phone-sized screen.
- Do not add paid third-party services unless necessary. Explain any new cost or API-key requirement before enabling it.
- Keep `.env.example` synchronized with the code and keep `.env` gitignored.

## Definition of done

The MVP is not done until a user can upload or select a demo manual, start a real Bolna-powered conversation through a supported channel, ask a question, receive grounded guidance with a source, explicitly confirm a work order, and see the resulting call/work-order record in the dashboard. If a live Bolna channel cannot be configured due to account or telephony constraints, implement the integration seam and a clearly-labelled simulator, and document exactly what remains blocked. Never present simulator output as a real call.
