#!/usr/bin/env bash
set -e

echo "=== Starting WattSathi Field Operations Stack ==="

# Check virtual environment
if [ -d ".venv" ]; then
  source .venv/bin/activate
elif [ -d "backend/.venv" ]; then
  source backend/.venv/bin/activate
else
  echo "Virtualenv not found. Setting up .venv..."
  python3 -m venv .venv
  source .venv/bin/activate
  pip install -r backend/requirements.txt
fi

export PYTHONPATH=backend

# Verify demo database seed
echo "Verifying database and demo seed..."
python3 -c "
from app.core.database import Base, engine, SessionLocal
from app.services.seed_service import SeedService
Base.metadata.create_all(bind=engine)
db = SessionLocal()
SeedService.seed_demo_data(db)
db.close()
print('Database verified and seeded.')
"

echo "Starting FastAPI backend on http://localhost:8000..."
uvicorn app.main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

echo "Starting Next.js dashboard on http://localhost:3000..."
cd frontend && npm run dev &
FRONTEND_PID=$!

trap "kill $BACKEND_PID $FRONTEND_PID" EXIT INT TERM

wait

