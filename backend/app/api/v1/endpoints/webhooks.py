from typing import Dict, Any
from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services.bolna_service import WebhookService

router = APIRouter()

@router.post("/bolna")
async def handle_bolna_webhook(
    request: Request,
    db: Session = Depends(get_db)
):
    try:
        payload = await request.json()
    except Exception:
        return {"status": "ignored", "reason": "invalid_json"}

    call = WebhookService.process_bolna_webhook(db=db, payload=payload)
    return {
        "status": "success",
        "call_id": call.id if call else None,
        "execution_id": call.bolna_execution_id if call else None
    }

