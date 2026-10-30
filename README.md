# WattSathi — AI Field Engineer for Solar Operations

This is the implementation pack for building WattSathi with Codex, Antigravity, or another coding agent.

WattSathi is a voice-first field-service assistant for rooftop-solar technicians. A technician speaks naturally in Hindi/Hinglish, the Bolna-powered agent retrieves relevant information from approved equipment documentation, follows a conservative troubleshooting workflow, and can create a structured work order after explicit confirmation.

## What is included

- `AGENTS.md` — project-wide rules for the coding agent.
- `START_HERE.md` — the first five steps.
- `PROMPT_FOR_CODING_AGENT.md` — the main copy/paste prompt for Codex or Antigravity.
- `docs/` — PRD, architecture, Bolna setup, voice prompt, safety policy, API contract, data model, UI specification, implementation sequence, QA plan, deployment and demo script.
- `fixtures/demo_manual.md` — a deliberately fictional manual for a safe, repeatable demo. It must never be presented as real manufacturer guidance.
- `.env.example` — names of required environment variables; no real secrets.
- `docker-compose.yml` — local PostgreSQL development database.

## Product scope

Build a polished working MVP, not a generic chatbot. The critical path is:

1. Upload an approved manual/SOP or use the clearly labelled fictional demo manual.
2. Register a demo solar site and inverter.
3. Start a real Bolna voice conversation (prefer Bolna's supported browser/Web Call SDK for the demo if available to the account; otherwise use an explicitly initiated test phone call).
4. Ask questions in Hindi/Hinglish.
5. Retrieve grounded source excerpts and follow safe diagnostic boundaries.
6. Create a work order only after the caller confirms the summary.
7. Show the call and work order in the dashboard.

## Recommended stack

- Frontend: Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui or equivalent accessible components.
- Backend: Python 3.12+, FastAPI, Pydantic v2, SQLAlchemy 2, Alembic.
- Database: PostgreSQL. Use PostgreSQL full-text search for the MVP so the retrieval layer does not require a separate paid embedding API.
- Voice: Bolna hosted voice agent. Keep all Bolna credentials on the server.
- Document extraction: PyMuPDF for PDFs and python-docx for DOCX where needed; support Markdown/TXT directly.
- Local development: Docker Compose for PostgreSQL; frontend and backend run locally.
- Deployment target: Vercel frontend + Render/Railway/Fly.io backend + managed PostgreSQL. Pick one provider after checking current free-tier and environment constraints.

The coding agent may recommend a materially simpler stack, but must document why and preserve all product requirements.

## Quick links

- Bolna dashboard: https://platform.bolna.ai/
- Bolna API docs: https://www.bolna.ai/docs/api-reference/introduction
- Bolna docs index: https://www.bolna.ai/docs/llms.txt
- Official Bolna skills: https://github.com/bolna-ai/skills
- Bolna AI voice platform: https://www.bolna.ai/ai-voice-agent-platform

## Important

The user's Bolna account has a stated $5 credit balance. Treat this as a strict demo budget. Do not place calls automatically, start campaigns, buy a phone number, or run repeated test calls. Start with one short manually approved test call and inspect the actual wallet usage. Bolna's public pricing currently describes a starting rate of $0.06/minute for bundled models, with telephony/platform charges potentially additional; actual charges depend on account configuration.
