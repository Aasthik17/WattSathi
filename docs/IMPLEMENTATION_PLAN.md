# Implementation plan and task checklist

Work in this sequence. Commit after each phase if Git is initialized. Keep tasks small and continuously runnable.

## Phase 0 — discovery and decisions

- [ ] Inspect current repository and runtime.
- [ ] Read current Bolna docs and official skills.
- [ ] Confirm whether this account supports Web Call SDK and whether the selected bundled Hindi STT/TTS/LLM options are included in the user's credit configuration.
- [ ] Decide browser call vs one controlled phone test. Document the reason.
- [ ] Create architecture decision record with actual choices.

## Phase 1 — backend foundation

- [ ] FastAPI app and `/api/v1/health`.
- [ ] Settings loaded from environment and validated at startup.
- [ ] SQLAlchemy models and Alembic migrations.
- [ ] PostgreSQL Docker Compose.
- [ ] Structured logging with secrets redacted.
- [ ] Admin login/session protection.
- [ ] Backend unit tests and health smoke test.

## Phase 2 — frontend foundation

- [ ] Next.js TypeScript app and visual tokens.
- [ ] App shell, navigation and responsive layout.
- [ ] Login page.
- [ ] Overview cards and empty states.
- [ ] Typed backend client, loading/error boundaries.
- [ ] Lint/typecheck/build.

## Phase 3 — sites/assets/work orders

- [ ] CRUD sites.
- [ ] CRUD assets with site validation.
- [ ] Work-order list/detail/status updates.
- [ ] Human verification action with audit trail.
- [ ] Seed command for fictional demo workspace/site/asset.

## Phase 4 — document knowledge

- [ ] Secure file upload and size/type validation.
- [ ] PDF/DOCX/TXT/MD extraction.
- [ ] Source-aware chunking with page/heading metadata.
- [ ] Postgres full-text index.
- [ ] Search endpoint filtered by workspace/site/model.
- [ ] Document list/preview/status UI.
- [ ] Ingestion failure and deletion tests.
- [ ] Add clearly-labelled fictional demo manual.

## Phase 5 — Bolna voice integration

- [ ] Secure Bolna API client.
- [ ] Create/reuse agent using official skill/MCP/current docs.
- [ ] Configure Hindi/Hinglish, supported transcriber, supported TTS and bundled fast LLM.
- [ ] Store agent ID and API key server-side.
- [ ] Implement actual supported call channel (Web Call SDK preferred if available).
- [ ] Show actual connection/call state; no fake success.
- [ ] Add explicit manual call confirmation and cost disclosure for phone calls.
- [ ] Manual live test with developer-owned device only.

## Phase 6 — tool calls

- [ ] Secure asset-context tool.
- [ ] Secure manual-search tool.
- [ ] Secure create-work-order tool.
- [ ] Validate tool auth, payload and asset/site relationship.
- [ ] Enforce explicit confirmation and idempotency.
- [ ] Log tool calls without secrets or sensitive unnecessary content.
- [ ] Configure the tools on Bolna using current official docs/skill.
- [ ] Test tool requests with mocked caller and unauthorized payloads.

## Phase 7 — webhooks and calls

- [ ] Configure Bolna webhook.
- [ ] Implement documented authenticity verification.
- [ ] Normalize current webhook event schema.
- [ ] Persist event and update call record idempotently.
- [ ] Reconcile delayed/failed events safely.
- [ ] Display call detail/transcript/summary/recording only where returned and enabled.

## Phase 8 — quality and demo readiness

- [ ] Backend tests all pass.
- [ ] Frontend lint/typecheck/build pass.
- [ ] Playwright smoke test uses mocked Bolna.
- [ ] Test no-doc, conflicting-doc, hazard, explicit-confirmation and duplicate-ticket paths.
- [ ] Verify `.env` ignored and no secrets in source/maps/logs.
- [ ] Verify phone call is never auto-initiated.
- [ ] Deploy frontend, backend and Postgres.
- [ ] Configure Bolna webhook to public HTTPS backend.
- [ ] Rehearse `DEMO_SCRIPT.md` and record a backup demo video.

## Stop conditions

- If Bolna Web Call SDK is unavailable, don't fake it. Move to the verified phone path or report the account limitation.
- If current Bolna tools cannot securely call the backend, do not expose write operations publicly. Use an app-mediated confirmation workflow.
- If no actual approved manual exists, use only the clearly-labelled fictional demo manual and explicitly state that the interaction is simulated training content.
- If cost is unclear, do not make the call until the user has checked the Bolna wallet/pricing configuration.
