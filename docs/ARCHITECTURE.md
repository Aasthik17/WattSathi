# Architecture

## System overview

```text
Technician browser / phone
          |
          | real voice session
          v
    Bolna Voice Agent  <------>  Bolna Knowledge Base (optional)
          |
          | secured custom HTTP function calls
          v
   WattSathi FastAPI backend
      |        |          |
      |        |          +---- Bolna webhook receiver
      |        +--------------- Manual search / work-order tools
      +------------------------ Site, asset, document, call APIs
          |
          v
      PostgreSQL
      - sites/assets
      - documents/chunks
      - work orders
      - call executions/events

Next.js dashboard <------> FastAPI backend
```

## Recommended repo layout

```text
wattsathi/
  AGENTS.md
  README.md
  .env.example
  docker-compose.yml
  frontend/
    app/
    components/
    lib/
    types/
  backend/
    app/
      main.py
      core/                 # settings, auth, logging
      api/v1/               # routers
      models/               # SQLAlchemy models
      schemas/              # Pydantic models
      services/             # documents, retrieval, Bolna, work orders
      integrations/bolna/   # API client, webhook parser, tool auth
      prompts/              # versioned voice prompts
    migrations/
    tests/
  fixtures/
    demo_manual.md
  docs/
```

## Boundaries

### Frontend

- Presentation and user interactions only.
- Never hold the Bolna API key or tool shared secret.
- Use backend auth and typed API clients.
- Do not simulate a successful call or work-order creation when the backend fails.

### FastAPI backend

- Owns app data and business rules.
- Owns all Bolna REST API calls that require the workspace API key.
- Validates function-tool requests from Bolna.
- Validates and persists webhooks idempotently.
- Performs document ingestion and source-aware retrieval.
- Creates work orders only after a confirmation flag and valid app context.

### Bolna

- Owns real-time voice transport, STT, LLM orchestration and TTS.
- Owns agent-level prompts, language/voice settings, function tool definitions and optional knowledge base.
- Sends execution/call webhooks after relevant events.
- Do not assume a webhook payload shape; normalize the current documented schema into an internal event model.

## Retrieval strategy

For MVP, use Postgres full-text search over chunks instead of a paid embedding service. Split extracted documents into sections of roughly 400–800 tokens with small overlap, preserving original page/heading metadata. Search within the selected site/company scope. Return no more than five excerpts. The tool response must include `source_title`, `page_or_section`, `excerpt`, and `document_id`.

If full-text search is weak for Hindi, instruct the voice agent to send both the caller's original phrase and a concise English technical query, while retaining fault codes/model numbers verbatim. Do not add a paid translation or embedding provider without asking.

## Bolna integration shape

Implement a `BolnaClient` service wrapper. Keep endpoint paths and payload schemas aligned with the live docs/official Bolna skills. Use timeouts, safe retries for reads, redacted logging and typed error translation. Store `BOLNA_AGENT_ID`; the preferred agent-creation path is the official Bolna skill/MCP or dashboard, not hand-constructed unverified JSON.

The backend tool endpoints should be narrow:

- `POST /api/v1/bolna-tools/get-asset-context`
- `POST /api/v1/bolna-tools/search-manual`
- `POST /api/v1/bolna-tools/create-work-order`

Expose only the endpoints needed by the configured Bolna agent. Verify whether Bolna custom tools support custom authorization headers in the current configuration. If yes, use `WATTSATHI_BOLNA_TOOL_SECRET`. If not, choose a safe documented authentication method; do not leave privileged endpoints open.

## Webhook handling

- `POST /api/v1/webhooks/bolna`
- Validate authenticity using the latest Bolna-supported method.
- Persist a unique event/execution identifier and a redacted raw payload.
- Use idempotent upsert semantics.
- Expect webhook retries, missing optional fields and events arriving out of order.
- Fetch the completed execution detail from Bolna API only if required and supported by current docs.
- A webhook must never directly create a new work order unless it carries a verified explicit confirmation event and the app's business rule accepts it.

## Authentication

For the prototype, implement a real admin login with password hashing and secure HTTP-only session/JWT cookie. Seed the development admin only via environment variables or an explicit seed command. Apply auth to dashboard and admin APIs. The Bolna function-tool and webhook endpoints use their own separate authentication path.

## Failure behavior

- Bolna API unavailable: dashboard shows disconnected/failed; do not report a live call.
- Webhook delayed: call record remains `processing` until fetched or reconciled.
- No matching document: agent says no approved guidance was found and escalates.
- Work-order tool timeout: use an idempotency key and show `creation_pending`; do not blindly create duplicate orders.
- Unknown Bolna payload: store a redacted event for diagnosis, return a non-2xx only where a retry is appropriate under Bolna's current webhook delivery contract.
