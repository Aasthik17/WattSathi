# 90–120 second Buildathon demo script

## Demo setup

Before presenting:

- Use the fictional `DemoVolt` manual and asset from `fixtures/demo_manual.md`, clearly labelled as simulated.
- Pre-create one demo site and asset.
- Confirm Bolna agent is active and call channel works.
- Ensure no unrelated real customer data is visible.
- Check credit balance and use only one short call.
- Have a screen recording backup in case the network/voice service fails.

## Script

### 0:00–0:15 — Problem

"Solar technicians often have the equipment in front of them but not an experienced engineer beside them. The right manual is hard to search on-site, and service context gets lost in calls and WhatsApp messages."

### 0:15–0:25 — Show product

Open WattSathi overview. Select the demo site and `DemoVolt` asset. Explain that the manual is explicitly a fictional fixture for this demonstration.

### 0:25–0:55 — Voice interaction

Start the real Bolna-powered voice session. Say in Hinglish:

"Namaste. Demo site par DemoVolt 3 kilowatt inverter hai. Display par GRID-STATUS-WARN likha aa raha hai. Iska approved manual kya batata hai?"

Expected: the agent calls the manual-search tool and gives a short source-grounded answer. It must not invent a repair step.

### 0:55–1:15 — Show the action

Say:

"Is observation ko senior engineer ke review ke liye work order mein record kar do."

The agent reads back the summary and asks for confirmation. Confirm explicitly. Show the returned ticket number and the dashboard record.

### 1:15–1:40 — Show operational value

Show the call record, evidence source, work order status `open`/`escalated`, and diagnosis state `unverified`.

### 1:40–2:00 — Vision

"WattSathi starts with solar O&M. Our ambition is to make expert technical knowledge accessible wherever frontline maintenance work happens — across energy, EV charging, HVAC and industrial equipment."

## Fallback

If the live call fails, show the actual recorded test call and label it as a recording. Do not simulate an active Bolna session or claim an action happened when the backend did not create it. If no live call has ever succeeded, state that the current demo is a prototype and disclose the blocked integration.
