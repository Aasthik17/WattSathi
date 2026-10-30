# QA and acceptance test plan

## Automated backend tests (mock Bolna)

### Health/auth

- Health endpoint returns ready status only when required dependencies are available.
- Invalid login fails without leaking whether a user email exists.
- Authenticated routes reject missing/expired sessions.
- Secrets are absent from logs and response payloads.

### Documents/retrieval

- Accept supported PDF/DOCX/TXT/MD within configured size limit.
- Reject executable, archive and unsupported files.
- Reject oversized documents.
- Preserve page/heading metadata for citations.
- Search is scoped to workspace/site and selected equipment context.
- No match returns `no_reliable_match=true`; never invent a match.
- Deleting a document removes/invalidates its chunks.
- Duplicate upload hash behavior is predictable and tested.

### Assets/work orders

- Asset cannot reference a site from another workspace.
- Work order cannot reference an unrelated asset/site.
- Missing caller confirmation is rejected.
- Same idempotency key cannot create two work orders.
- Voice-created work order begins `unverified` and is not `resolved`.
- Only authorized human role may set `human_verified`.
- Audit log created for work-order changes.

### Bolna client/webhooks/tools

- API errors are converted to safe, typed application errors.
- Timeout is handled without a false success state.
- Unauthorized tool call rejected.
- Invalid tool payload rejected.
- Webhook signature/auth check uses current Bolna contract.
- Duplicate webhook event is not processed twice.
- Out-of-order event does not regress a completed call to a prior state.
- Missing optional transcript/recording/cost values does not crash the app.
- Automated tests never call the live Bolna API or spend credits.

## Voice scenario tests (manual, only when user approves a live call)

1. **Normal source-backed question:** demo asset + a question answered by one exact page of the demo manual. Agent cites page/section.
2. **Unknown fault code:** agent says it cannot find approved information and offers escalation.
3. **Hazard trigger:** caller reports burning smell/smoke; agent stops diagnosis and gives safe escalation language.
4. **Hinglish:** model name and fault code remain unchanged; speech is understandable.
5. **Work-order confirmation:** agent reads back summary; only after explicit yes is the work order created.
6. **No confirmation:** agent does not create a work order.
7. **Tool failure:** agent says the ticket was not created; no fabricated ticket ID.

## Frontend smoke tests

- Login/logout.
- Dashboard empty and populated states.
- Create site and asset.
- Upload demo manual and view indexing status.
- Start/end voice flow (mocked in CI; real only manually).
- View calls and work orders.
- Mobile layout and keyboard navigation.

## Final acceptance checklist

A demo operator can complete the entire workflow in under two minutes, and every displayed call/tool/work-order state is backed by an actual backend/provider response or clearly labelled demo fixture.
