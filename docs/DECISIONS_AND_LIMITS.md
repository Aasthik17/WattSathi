# Decisions, constraints and assumptions

## Decisions

- First vertical: rooftop solar O&M in India.
- Initial users: solar field technicians and senior engineers.
- Voice platform: Bolna AI.
- First language: Hindi/Hinglish, with English technical strings preserved.
- First workflow: identify asset → ask symptoms → retrieve approved manual → safe checks or escalation → explicit confirmation → work order.
- Initial retrieval: low-cost source-aware Postgres full-text search; no paid embedding dependency.
- Initial voice channel: browser/Web Call SDK where available; otherwise explicitly initiated test phone call.

## Assumptions to verify

- The Bolna account has access to a suitable Hindi/Hinglish transcriber and voice.
- The selected STT/LLM/TTS models are within the account's bundled pricing or clearly priced.
- The account supports the chosen web call or phone call route.
- Bolna custom function tools support the required secure HTTP endpoint configuration.
- Bolna webhook payload/authentication format matches the live docs at integration time.
- The first pilot customers can supply approved manuals and SOPs.

## Explicit limitations

- The initial app does not connect to live inverter telemetry.
- It cannot verify physical conditions or certify repairs.
- It does not provide live electrical measurements or remote equipment control.
- A model's confidence is not a safety guarantee.
- The included demo manual is fictional and must be labelled as such.
- Full cross-customer operational intelligence and predictive maintenance require real consented field data, much more validation and a later product phase.

## Cost note

The user reports $5 in Bolna credits. Public Bolna materials currently advertise a $0.06/minute starting rate for bundled voice components, while telephony/platform costs may be additional and some models/providers may be usage-billed separately. This is not a guarantee that $5 equals a fixed number of call minutes. Check the exact account wallet and execution-level cost before/after each live test.
