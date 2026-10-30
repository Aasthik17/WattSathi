# Local development and deployment

## Local prerequisites

- Node.js LTS compatible with the selected Next.js version.
- Python 3.12 or a compatible supported version.
- Docker Desktop / Docker Engine with Compose.
- Bolna account and API key for live voice integration.

The coding agent must pin and document exact versions in `package.json`, lockfile and Python dependency file after implementation.

## Local database

From the repo root:

```bash
docker compose up -d db
```

## Environment

```bash
cp .env.example .env
```

Fill in required values. Never commit `.env`.

## Backend (expected commands; align with generated project)

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\\Scripts\\activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

## Frontend (expected commands; align with generated project)

```bash
cd frontend
npm install
npm run dev
```

Open the local frontend URL shown by Next.js. The backend health endpoint should be reachable at `http://localhost:8000/api/v1/health` unless the agent documents a different prefix.

## Production topology

- Frontend: Vercel or another Next.js-compatible host.
- Backend: Render, Railway, Fly.io or another Python ASGI-compatible host.
- Database: managed PostgreSQL (e.g. Neon/Supabase or provider-managed Postgres).
- File storage: use private object storage for uploaded manuals; local filesystem storage is for development only.
- Bolna: configure agent webhook to the backend's public HTTPS URL.

Check current free-tier terms, sleep behavior, file storage limits, outbound networking and region support before choosing providers; do not assume a free service is suitable for a live demo.

## Required production environment variables

Set them through the host's secret manager, not by uploading `.env`:

- `DATABASE_URL`
- `JWT_SECRET`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD` or a secure bootstrap hash, depending on implementation
- `BOLNA_API_KEY`
- `BOLNA_AGENT_ID`
- `WATTSATHI_BOLNA_TOOL_SECRET` (if supported by current tool auth mechanism)
- `BOLNA_WEBHOOK_SECRET` (only if the current Bolna webhook method provides/configures one)
- `APP_BASE_URL`
- `BACKEND_CORS_ORIGINS`
- `FILE_STORAGE_BUCKET` / storage credentials when object storage is enabled

Keep frontend-exposed environment variables limited to public API base URLs and public identifiers. Never prefix secrets with `NEXT_PUBLIC_`.

## Deployment verification

- Run database migrations.
- Verify backend health and readiness.
- Verify frontend can authenticate and reach backend.
- Verify CORS includes the deployed frontend origin only.
- Verify HTTPS and the exact Bolna webhook callback URL.
- Verify webhook authenticity and event ingestion with a test event or safe provider test mechanism.
- Make one manually approved live voice call only after wallet/cost check.
- Verify call completion, work-order action and dashboard record.
- Check logs for secrets, full tokens or unnecessary personal data; rotate any exposed key immediately.
