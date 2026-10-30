# Data model

Use UUID primary keys, UTC timestamps, SQLAlchemy 2 models and Alembic migrations. Every domain entity that belongs to a customer/company should have a `workspace_id` even if the hackathon demo seeds only one workspace; this avoids an expensive rewrite if the product continues.

## Tables

### `workspaces`

- `id`, `name`, `created_at`

### `users`

- `id`, `workspace_id`, `email`, `password_hash`, `display_name`, `role` (`admin`, `manager`, `technician`), `is_active`, `created_at`, `last_login_at`

### `sites`

- `id`, `workspace_id`, `site_code`, `name`, `address_text` (optional), `timezone` (default `Asia/Kolkata`), `contact_name` (optional), `contact_phone` (optional), `notes`, timestamps

### `assets`

- `id`, `workspace_id`, `site_id`, `asset_code`, `category`, `manufacturer`, `model`, `serial_number` (nullable), `rated_capacity_kw` (nullable), `installed_on` (nullable), `warranty_end_date` (nullable), `notes`, `is_active`, timestamps
- Unique `(workspace_id, asset_code)`.

### `documents`

- `id`, `workspace_id`, `site_id` (nullable for workspace-wide document), `title`, `original_filename`, `mime_type`, `storage_key`, `sha256`, `document_type` (`manufacturer_manual`, `company_sop`, `warranty`, `other`), `status` (`uploaded`, `processing`, `ready`, `failed`), `uploaded_by`, `created_at`, `processed_at`, `error_summary`
- Keep file storage outside the SQL row. Never store arbitrary executable content.

### `document_chunks`

- `id`, `document_id`, `workspace_id`, `site_id` (nullable), `asset_model_scope` (nullable), `chunk_index`, `page_number` (nullable), `section_heading` (nullable), `content`, `search_vector` (Postgres tsvector or equivalent), `token_count`, `created_at`
- Index by workspace/site and full-text search vector.

### `calls`

- `id`, `workspace_id`, `bolna_execution_id` (unique nullable until available), `bolna_agent_id`, `site_id`, `asset_id`, `initiated_by`, `channel` (`web`, `phone`, `unknown`), `language`, `status`, `started_at`, `ended_at`, `duration_seconds`, `cost_amount` (nullable), `cost_currency` (nullable), `summary`, `transcript_text` (nullable), `recording_url` (nullable), `termination_reason` (nullable), timestamps
- Recording/transcript retention and access must be restricted.

### `call_events`

- `id`, `workspace_id`, `call_id`, `provider_event_id` (nullable unique), `event_type`, `occurred_at`, `received_at`, `payload_redacted` (JSONB), `processing_status`, `error_summary`

### `work_orders`

- `id`, `workspace_id`, `work_order_number`, `site_id`, `asset_id`, `call_id` (nullable), `created_by`, `assigned_to` (nullable), `issue_title`, `observations` (JSONB), `suspected_cause` (nullable), `evidence_refs` (JSONB), `recommended_safe_next_step`, `priority`, `status`, `diagnosis_state` (`unverified`, `human_verified`, `not_applicable`), `caller_confirmed_at`, `human_verified_by` (nullable), `human_verified_at` (nullable), `idempotency_key` (unique), timestamps

### `audit_logs`

- `id`, `workspace_id`, `actor_type`, `actor_id`, `action`, `entity_type`, `entity_id`, `metadata_redacted` (JSONB), `created_at`

## Data integrity rules

- `assets.site_id` must belong to the same workspace as the asset.
- `documents.site_id` must belong to the same workspace.
- Search must always filter by workspace and site scope.
- A work order's asset must belong to the selected site/workspace.
- `caller_confirmed_at` is required for voice-created work orders.
- Only an authenticated human manager/engineer may set `diagnosis_state=human_verified`.
- A work order may exist while diagnosis remains unverified.
- Webhook event processing must be idempotent.
