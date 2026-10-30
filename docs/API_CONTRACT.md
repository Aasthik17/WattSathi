# Internal API contract

This is the WattSathi app's internal API contract, not Bolna's API schema. Use consistent `/api/v1` routes and Pydantic request/response models. Adjust naming if needed, but preserve behavior.

## Dashboard/admin endpoints

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/v1/health` | Health/readiness |
| POST | `/api/v1/auth/login` | Admin login |
| POST | `/api/v1/auth/logout` | Clear session |
| GET | `/api/v1/auth/me` | Current user |
| GET/POST | `/api/v1/sites` | List/create sites |
| GET/PATCH/DELETE | `/api/v1/sites/{site_id}` | Site details/update/delete with safeguards |
| GET/POST | `/api/v1/assets` | List/create assets |
| GET/PATCH/DELETE | `/api/v1/assets/{asset_id}` | Asset details/update/delete |
| GET/POST | `/api/v1/documents` | List/upload approved documents |
| GET | `/api/v1/documents/{document_id}` | Document metadata/ingestion state |
| DELETE | `/api/v1/documents/{document_id}` | Delete document and chunks |
| POST | `/api/v1/documents/{document_id}/reindex` | Re-index document |
| GET | `/api/v1/work-orders` | Filter/list work orders |
| GET | `/api/v1/work-orders/{work_order_id}` | Work-order details |
| PATCH | `/api/v1/work-orders/{work_order_id}` | Update status/assignment/human verification |
| GET | `/api/v1/calls` | List call executions |
| GET | `/api/v1/calls/{execution_id}` | Call detail, transcript and linked work orders |
| POST | `/api/v1/calls/test` | Start manually confirmed test call only, if this call mode is selected |
| GET | `/api/v1/analytics/overview` | Small dashboard KPI summary |

## Bolna-to-backend function tools

These endpoints are not general public app APIs. Protect them using the strongest supported current Bolna tool authentication and server-side validation.

### `POST /api/v1/bolna-tools/get-asset-context`

Input (conceptual):

```json
{
  "asset_code": "WS-DEMO-001",
  "site_id": "server-resolved-or-signed-context"
}
```

Output: asset ID/code, site display name, manufacturer/model, installation metadata if present, and permitted recent maintenance context. Do not return unrelated customer personal data.

### `POST /api/v1/bolna-tools/search-manual`

Input (conceptual):

```json
{
  "asset_id": "valid-app-context-id",
  "query": "exact display code and short technical question",
  "language": "hi-Latn"
}
```

Output (conceptual):

```json
{
  "matches": [
    {
      "document_id": "...",
      "source_title": "...",
      "page_or_section": "p. 12 / Fault diagnostics",
      "excerpt": "...",
      "evidence_level": "source_backed"
    }
  ],
  "no_reliable_match": false,
  "instruction": "Use only the returned excerpts; do not extrapolate."
}
```

Rules: only search documents authorized for the selected site/company and equipment model; return max 5 short excerpts; keep fault codes intact; if no reliable match, return an explicit no-match result instead of a guess.

### `POST /api/v1/bolna-tools/create-work-order`

Input (conceptual):

```json
{
  "site_id": "app-context-id",
  "asset_id": "app-context-id",
  "issue_title": "Inverter warning shown on display",
  "observations": ["Caller reports the display warning is visible"],
  "suspected_cause": null,
  "evidence_document_ids": ["..."],
  "recommended_safe_next_step": "Escalate to qualified engineer for inspection",
  "priority": "normal",
  "caller_confirmed": true,
  "call_execution_id": "optional-bolna-execution-id",
  "idempotency_key": "stable-unique-key"
}
```

The backend must reject missing confirmation, invalid asset/site association, unknown document IDs, duplicate idempotency key conflicts, and unauthorized tool requests. Do not accept model-generated `human_verified=true` or a claimed repair result.

## Bolna webhook

`POST /api/v1/webhooks/bolna`

The exact payload is version-/event-dependent. Use official Bolna webhook docs and skills to identify current event names, signature/auth mechanism, execution ID and event ordering. Normalize only fields that actually exist. Store a redacted copy for troubleshooting. Respond with the status code required by the documented retry semantics.

## Error envelope

```json
{
  "error": {
    "code": "DOCUMENT_NOT_FOUND",
    "message": "The requested approved document was not found.",
    "request_id": "..."
  }
}
```

Never return stack traces, API keys, bearer tokens, database URLs or unredacted raw provider errors to the client.
