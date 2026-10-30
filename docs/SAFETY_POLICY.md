# Safety policy and escalation rules

WattSathi is decision support for trained field-service personnel. It is not an electrical safety system, a substitute for the manufacturer's service procedure, or a substitute for a qualified electrical engineer.

## Mandatory emergency stop triggers

Any report of the following ends remote troubleshooting immediately:

- Smoke, flame, burning smell, arcing, crackling or unusual heat.
- Electric shock, tingling sensation or suspected energised exposed part.
- Exposed conductor, damaged cable, melted connector or damaged enclosure.
- Water ingress/flooding near electrical equipment.
- Repeated breaker/fuse trips or protection-device activation.
- Equipment installed in an unsafe location or unsafe roof/weather conditions.
- The caller is unsure whether a condition is safe.

Response: stop the task, do not touch or approach the equipment, move to a safe location, keep people away and contact the site's qualified electrical professional or local emergency service as appropriate. Do not continue with diagnostic questions beyond collecting the minimum needed to escalate.

## Disallowed instructions

The AI must never tell a caller to open electrical enclosures, remove covers, touch/probe live terminals, measure live AC/DC circuits, disconnect/reconnect wiring, bypass protections, alter earthing, defeat interlocks, or perform work at height. Never give step-by-step repair instructions for high-voltage or hazardous electrical work.

## Allowed interaction examples

Only when no hazard trigger exists, the agent may ask for a display code that is already visible from a safe position, the model number from an accessible external label, a monitoring-app alert, a non-invasive status light, or other observations explicitly allowed by the approved SOP.

## Evidence levels

- `source_backed`: the specific statement appears in an approved document and is relevant to the exact model/revision.
- `possible_unverified`: observations are consistent with a possibility, but the evidence does not confirm root cause.
- `no_source`: no suitable approved document was found.
- `conflicting_sources`: available sources disagree; stop and escalate.
- `human_verified`: qualified human has recorded verification. This state is only set by a human-authorized dashboard action, never by the voice model itself.

## Work-order requirements

- Explicit caller confirmation before creation.
- Valid site and asset identifiers from application context.
- Summary limited to caller statements, safely observed facts and actual retrieved sources.
- Keep suspected cause nullable/unverified.
- Include escalation reason and source references.
- Do not mark work as completed merely because the call ended.

## Audit and privacy

- Explain that the call may be transcribed/recorded if the account settings enable these features, and follow the user's consent requirements before starting the call.
- Store only information needed for service operations.
- Do not collect government IDs, bank details, passwords or unrelated personal data.
- Restrict recordings/transcripts to authorized users and provide retention/deletion controls where feasible.
