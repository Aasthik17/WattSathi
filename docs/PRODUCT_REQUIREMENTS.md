# Product requirements — WattSathi

## One-line description

WattSathi is a voice-first AI field engineer that helps rooftop-solar service technicians retrieve approved technical guidance, record findings and escalate uncertain faults.

## Target user and buyer

- Primary user: field technician employed by a rooftop-solar EPC/O&M business.
- Secondary user: senior engineer/service manager who handles escalations and reviews work orders.
- Buyer: owner, operations head or service manager at a solar EPC/O&M company.

## Problem

Technicians may not have immediate access to an experienced engineer or the right section of a manufacturer manual while on site. Important fault context is often scattered across calls, paper notes and messaging groups. This causes repeated interruptions, uneven processes and incomplete service records.

## MVP objective

Demonstrate that a technician can use a natural phone/browser voice conversation in Hindi/Hinglish to get a short source-grounded answer and turn the confirmed outcome into a trackable service work order.

## Core user journey

1. Technician selects a site and asset or identifies it by a known asset code.
2. Technician starts a WattSathi voice session.
3. Agent confirms the equipment identity and asks what the technician observes.
4. Agent searches the approved manual/SOP and cites the source verbally in a short way.
5. Agent asks one diagnostic question at a time, staying within safe non-invasive checks.
6. Agent states whether the evidence suggests a possible issue, remains inconclusive, or requires human escalation.
7. Agent summarizes observations and proposed next action.
8. Technician explicitly says yes to creating a work order.
9. Backend creates the work order and links it to the Bolna execution/call where possible.
10. Dashboard displays call summary, evidence, work order and escalation state.

## MVP feature requirements

### Dashboard

- Overview metrics: active sites, assets, open work orders, calls in the last 7 days.
- Recent calls table with status, date, duration, language and linked asset.
- Open work orders with priority, status, assigned technician and creation date.
- Knowledge-base document list with processing status.
- Prominent voice-session action.

### Sites and assets

- Create/edit sites and assets.
- Asset fields: asset code, site, equipment category, manufacturer, model, serial number (optional), rated capacity (optional), installation date (optional), warranty end date (optional), notes.
- Never infer a value that the user has not provided.
- Search/select an asset before the voice session. For MVP, one selected asset is in scope per call.

### Knowledge base

- Upload PDF, DOCX, TXT or Markdown.
- Validate MIME type and file size; reject executable files and archives.
- Extract text and split into source-aware chunks.
- Store source title, uploaded by, site/company scope, page or heading, chunk text and ingestion status.
- Search returns ranked excerpts with citations and relevance score.
- Support deleting a document and its chunks.
- Document-level scope is required to prevent cross-site/customer leakage.

### Voice experience

- Bolna is the voice engine; the app must not substitute browser speech synthesis as if it were Bolna.
- Prefer official Bolna browser/Web Call SDK for the hackathon demo if available to the account. Otherwise provide a manually initiated test call using a configured phone route.
- Hindi/Hinglish is the initial language. English terms such as model names, fault codes and electrical units should be preserved accurately.
- Start and end controls, live call state, selected asset context and post-call result.
- No background/automatic outbound calls.

### Work orders

- Status: `open`, `assigned`, `in_progress`, `awaiting_parts`, `escalated`, `resolved`, `closed`.
- Priority: `low`, `normal`, `high`, `urgent`.
- Fields: site, asset, issue title, technician observations, suspected cause (nullable), evidence/source references, recommended safe next step, status, priority, created timestamp, call/execution reference, human verification flag.
- A work order created by voice must be explicitly confirmed by caller.
- Mark diagnoses `unverified` until a qualified human confirms the actual cause/repair.

### Call records

- Persist Bolna execution/call ID, agent ID, call status, call timestamps, duration and available cost fields.
- Store transcript, summary, recording link and extractions only when Bolna returns them and account settings permit storage.
- Do not assume all payload fields are always present. Preserve raw event in a restricted audit record with secrets redacted.
- Display a graceful partial state while a call is in progress or a webhook is delayed.

## Non-goals for this buildathon MVP

- Autonomous inverter control or remote switching.
- Live electrical measurements or IoT integration.
- Predictive-maintenance ML model.
- Payments, inventory procurement or vendor marketplace.
- Automatic dispatch or autonomous technician assignment.
- Large-scale outbound campaigns.
- Multi-tenant SaaS billing or enterprise SSO.
- Diagnosing every inverter brand/model.

## Product success criteria

- A first-time user can understand the product within 15 seconds.
- A demo voice session can complete the core flow in 2 minutes.
- Every technical recommendation is grounded in an approved source or explicitly marked unavailable.
- One confirmed call can create one auditable work order.
- A senior engineer can review call context and correct an unverified diagnosis.
