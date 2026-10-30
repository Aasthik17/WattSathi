# UI specification

## Visual direction

Build a premium, trustworthy field-operations product. Avoid the generic AI dashboard aesthetic.

- Palette: graphite/near-black text, warm off-white or slate surfaces, restrained solar amber for primary actions, teal/green for healthy states, red only for urgent danger.
- Typography: clean sans-serif with strong hierarchy and readable numeric labels.
- Layout: left navigation on desktop, compact top bar, responsive mobile navigation.
- Components: clear cards, compact tables, status badges, useful empty states, skeletons, toast errors and confirmation dialogs.
- Avoid huge gradients, glassmorphism everywhere, emoji icons and excessive animation.
- Use Lucide icons and consistent spacing.
- Support keyboard navigation, visible focus states, labels and accessible contrast.

## Main navigation

1. Overview
2. Voice workspace
3. Sites & assets
4. Knowledge base
5. Work orders
6. Calls
7. Settings (Bolna connection, account and safety disclosure)

## Overview page

- Welcome header and a small statement: "Expert guidance for every field technician."
- KPI cards: Active sites, Active assets, Open work orders, Calls this week.
- Primary CTA: `Talk to WattSathi`.
- Recent calls list: time, technician, asset, language, status, duration.
- Work orders needing attention: priority, issue, site/asset, status.
- Knowledge-base status with document count and failed-ingestion alert.
- Do not show fabricated analytics; use empty states when no data exists.

## Voice workspace

- Selected site and asset selector, with asset model displayed prominently.
- Large central call control with states: Ready, Connecting, Listening, Agent speaking, Reconnecting, Ended, Failed.
- Show a clear notice before starting: call may be recorded/transcribed depending on Bolna configuration; avoid sharing personal or sensitive information.
- If browser Web Call SDK provides real transcript events, show them. Otherwise show only actual call metadata once Bolna reports it.
- One-click end call.
- After a call, show actual summary, source excerpts, work order and escalation result.
- Test phone call flow must show phone number, cost notice and explicit confirm checkbox.

## Sites & assets

- Searchable table/list.
- Create/edit forms with clear optional vs required fields.
- Asset detail panel shows model, site, installation metadata and linked docs/work orders/calls.
- Never display fake warranty or maintenance history.

## Knowledge base

- Drag/drop and file picker.
- Accepted formats and max file size shown before upload.
- Rows display title, scope, doc type, pages/chunks if known, status and last updated.
- Clearly flag the fictional demo manual as `SIMULATED — NOT A REAL MANUFACTURER MANUAL`.
- Document preview displays extracted text and source page/section.
- Delete action requires confirmation.

## Work orders

- Filters by status, priority and site.
- Work-order detail displays issue, observations, source references, recommended safe next step, call link and diagnosis state.
- `Human verify` action available only to manager/engineer; capture who verified and when.
- Do not default new work orders to `resolved`.

## Calls

- Table with execution ID (short), start/end time, status, language, duration, cost if returned, site and asset.
- Detail page has transcript, summary, source references, available recording link and linked work orders.
- Missing fields should show `Not provided by voice platform`, not invented defaults.

## Settings

- Bolna connection status (configured/not configured/error) without displaying API key.
- Agent name/ID (ID may be partially masked).
- Public webhook URL and verification status.
- Safety and recording disclosure text.
