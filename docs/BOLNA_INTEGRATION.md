# Bolna setup and integration

Last checked against Bolna's public documentation on 30 October 2026. Re-check the live docs and official skills before implementation because schemas and supported models can change.

## Official resources

- Dashboard: https://platform.bolna.ai/
- API introduction/authentication: https://www.bolna.ai/docs/api-reference/introduction
- Full docs index: https://www.bolna.ai/docs/llms.txt
- Official AI coding skills: https://github.com/bolna-ai/skills
- Official MCP server: https://mcp.bolna.ai/
- Hindi voice guidance: https://www.bolna.ai/hindi-text-to-speech
- Voice agent platform overview: https://www.bolna.ai/ai-voice-agent-platform
- Pricing: https://www.bolna.ai/pricing

## 1. Generate an API key

In Bolna Dashboard, go to **Developers → API Keys**, create a key and copy it immediately. Bolna documents bearer authentication:

```http
Authorization: Bearer YOUR_BOLNA_API_KEY
```

The key is only shown once. Store it in `.env` locally and in the backend hosting provider's secret manager in production. Do not expose it to the browser.

## 2. Install the official Bolna Agent Skills

```bash
npx skills add bolna-ai/skills -a codex
```

The official collection includes skills for API-key setup, agent creation, prompt writing, knowledge bases, function tools, webhooks, execution retrieval and debugging. If using Antigravity, try the interactive install without `-a codex` and select it if detected. Keep `AGENTS.md` as the durable project-specific instructions.

## 3. Optional Bolna MCP for Codex

```bash
export BOLNA_API_KEY="YOUR_BOLNA_API_KEY"
codex mcp add bolna --url https://mcp.bolna.ai/api/mcp --bearer-token-env-var BOLNA_API_KEY
```

Restart Codex and verify that it can list/read the Bolna workspace. This enables the coding agent to operate Bolna tools. It does not replace the backend's runtime API key.

For Antigravity, register a remote HTTP MCP server in its MCP settings with URL `https://mcp.bolna.ai/api/mcp` and header `Authorization: Bearer YOUR_BOLNA_API_KEY`, if supported by the installed version. Do not store the key in a checked-in project config.

## 4. Create the agent

Use the official `create-agent` and `prompt-writing` skills or Agent Studio. Preferred initial configuration:

- Agent name: `WattSathi Field Engineer`
- Primary language: Hindi; support natural Hindi-English code switching/Hinglish.
- STT: Sarvam Saaras v4 is a good starting choice for Indian speech and code-mixed Hindi/English, subject to availability in the account.
- TTS: a supported Hindi/code-mixed voice such as Sarvam Bulbul v4 Flash or Kalpa; audition available voices and choose the clearest/lowest-cost option.
- LLM: choose a fast model included in Bolna's currently bundled/preferred models. Check the live pricing page/model list; do not enable premium usage-based models without explicit approval.
- Agent type: conversation agent initially. Use graph agents only if a deterministic call flow proves necessary and the demo timeline permits it.
- Prompt: use `VOICE_AGENT_PROMPT.md`.
- Tools: add only the tools described in `ARCHITECTURE.md` and `API_CONTRACT.md`.
- Knowledge base: optional if the backend `search_manual` tool is the source of truth. Avoid indexing the same docs twice unless there is a clear reason.
- Webhook: set the public backend webhook URL after deployment.

Do not invent JSON request fields. Use current official skill instructions or docs to create the agent and tools. Record the resulting agent ID in `BOLNA_AGENT_ID`.

## 5. Choose the demo channel

Preferred order:

1. **Bolna Web Call SDK**, if current account/docs allow this and implementation is feasible. This avoids buying a dedicated phone number just for a demo. Use the official SDK; do not fake a call with browser TTS.
2. An existing inbound number already connected to the account.
3. One manually initiated outbound test call to the developer's own phone, after showing a clear cost notice and requiring confirmation.

Do not buy a number automatically. Bolna's public overview lists a dedicated number at $5/month; that is the full stated free-credit amount before any call usage, so do not assume the free credit will cover it.

The app must not launch batch calls or automatically dial technicians.

## 6. Hindi/Hinglish quality

- Add Hindi and English according to the current multilingual-agent setup documentation.
- Bolna's Hindi guide recommends setting Hindi explicitly for the transcriber rather than relying solely on auto-detection when the call is known to be Hindi-first.
- Preserve inverter model names, fault codes, serial strings and units in Latin script exactly as spoken where possible.
- Use short utterances; test real local pronunciation of technical words.
- Avoid a long opening monologue. Ask the technician to describe the visible fault first.

## 7. Custom function tools

The app needs narrow HTTP tools for `get_asset_context`, `search_manual` and `create_work_order`. Bolna documents custom function tools using an OpenAI-style function-calling format and the ability to call a custom HTTP endpoint. However, the exact tool configuration/request schema must be taken from the live docs or official `setup-tools` skill at implementation time.

Security requirements:

- Use a secret header if current Bolna custom tools support it.
- Verify the secret in constant time.
- Rate-limit and validate payloads.
- Bind calls to a valid site/asset context selected before the call; do not let the model invent arbitrary IDs.
- Make work-order creation idempotent.
- If secure auth is not possible with the selected tool path, do not expose a privileged endpoint without protection; use a documented alternative such as an app-mediated confirmation step.

## 8. Webhooks and post-call data

Set the agent's webhook URL using the current docs/official `setup-webhook` skill. Capture only fields that the current Bolna webhook/execution APIs actually return. Depending on agent/account configuration, execution detail can include call status, duration, cost, transcript, summary, recording and extractions. All are optional from WattSathi's perspective.

Implement webhook idempotency and signature/authenticity validation as documented. Do not rely on guessed webhook IPs or guessed signature headers. Do not assume legacy extraction fields still exist; Bolna's docs list an October 2026 extraction migration and note retirement of some older extraction features.

## 9. $5 credit protection

- Check the Bolna wallet in the dashboard before each real test.
- First test: one developer-controlled call, ideally 60–120 seconds.
- Do not run concurrent calls.
- Do not put live calls in automated tests or CI.
- Do not create a campaign or trigger a bulk dial.
- Inspect the execution cost after the test and adjust the demo plan.
- Public pricing currently advertises a starting bundled rate of $0.06/minute. Telephony/platform fees or non-bundled models may add cost. The exact spend depends on the configuration in this account; verify in Bolna before using credits.

## 10. Debugging checklist

- Confirm API key is valid and stored server-side.
- Confirm agent exists and is active.
- Confirm the chosen channel/number is actually provisioned and linked.
- Confirm the exact languages, transcriber and voice are saved on the agent.
- Confirm public tool endpoint is reachable over HTTPS.
- Confirm tool auth headers are sent exactly as configured.
- Confirm webhook URL is public HTTPS and events arrive.
- Check the Bolna execution record for provider errors, latency, transcript and cost.
- Test one change at a time; do not repeat paid calls blindly.
