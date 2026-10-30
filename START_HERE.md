# Start here

## 1. Create the project directory

Extract this pack, open the folder in Codex or Antigravity, and ask the coding agent to follow `PROMPT_FOR_CODING_AGENT.md` and `AGENTS.md`.

## 2. Give the coding agent access to Bolna's official skills

Install Node.js/npm if the `npx` command is unavailable. From the project root:

```bash
npx skills add bolna-ai/skills -a codex
```

For Antigravity, run `npx skills add bolna-ai/skills` and choose Antigravity if it is detected; otherwise rely on the checked-in `AGENTS.md` and the Bolna MCP connection below. The official repository lists Codex and other Agent Skills-compatible clients.

The most relevant Bolna skills are `setup-api-key`, `create-agent`, `create-knowledgebase`, `prompt-writing`, `setup-tools`, `setup-webhook`, `get-executions`, and `debug-bolna-calls`.

## 3. Connect Bolna MCP to Codex (optional but recommended)

In the same terminal session, set your API key and register the official MCP server:

```bash
export BOLNA_API_KEY="YOUR_BOLNA_API_KEY"
codex mcp add bolna --url https://mcp.bolna.ai/api/mcp --bearer-token-env-var BOLNA_API_KEY
```

Restart Codex after adding the server. This MCP connection is for the coding agent to inspect/manage your Bolna workspace. The running WattSathi backend still needs `BOLNA_API_KEY` in its own server environment.

For Antigravity, add a custom remote HTTP MCP server in its MCP settings using:

- URL: `https://mcp.bolna.ai/api/mcp`
- Authorization header: `Bearer YOUR_BOLNA_API_KEY`

Do not commit the key or paste it into source files. If the client does not support remote HTTP MCP, skip this and use Bolna Agent Studio/dashboard.

## 4. Configure environment variables

```bash
cp .env.example .env
```

Fill in the Bolna values after the agent has helped you create/configure the agent. Keep `.env` private and never commit it.

## 5. Build in vertical slices

Tell the coding agent to implement in this order:

1. Repo scaffold, database and health endpoint.
2. Dashboard shell and seeded demo site/asset.
3. Document upload, extraction, chunking and source-grounded search.
4. Bolna agent setup and test voice conversation.
5. Secure backend tools for manual search and ticket creation.
6. Bolna webhook ingestion and call timeline.
7. Polish, tests, deployment and demo rehearsal.

Do not buy a number or run outbound campaigns for the first pass. Start with Bolna browser/Web Call SDK if the current account and docs support it; otherwise use one manually initiated test call to your own number.

## 6. Check your credit balance before testing

The stated account credit is $5. Start with one short call. Do not use loops or automated test suites that make real calls. Unit tests must mock Bolna responses.
