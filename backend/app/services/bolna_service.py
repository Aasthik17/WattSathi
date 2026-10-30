import os
import httpx
from datetime import datetime, timezone
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.core.config import settings
from app.models.workspace import Workspace
from app.models.call import Call
from app.models.call_event import CallEvent

class BolnaClient:
    def __init__(self, api_key: Optional[str] = None, base_url: Optional[str] = None):
        self.api_key = api_key or settings.BOLNA_API_KEY
        self.base_url = (base_url or settings.BOLNA_API_BASE_URL).rstrip("/")

    @property
    def is_configured(self) -> bool:
        return bool(self.api_key and self.api_key.strip())

    def _headers(self) -> Dict[str, str]:
        if not self.is_configured:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="BOLNA_API_KEY is not configured in backend environment."
            )
        return {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

    async def get_me(self) -> Dict[str, Any]:
        """Check wallet balance, account details, and API key validity"""
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(f"{self.base_url}/user/me", headers=self._headers())
            if resp.status_code != 200:
                raise HTTPException(
                    status_code=resp.status_code,
                    detail=f"Bolna API error: {resp.text}"
                )
            return resp.json()

    async def list_agents(self) -> Any:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(f"{self.base_url}/v2/agent", headers=self._headers())
            if resp.status_code != 200:
                raise HTTPException(
                    status_code=resp.status_code,
                    detail=f"Bolna API error: {resp.text}"
                )
            return resp.json()

    async def create_agent(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new Bolna agent using official v2 API"""
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(
                f"{self.base_url}/v2/agent",
                headers=self._headers(),
                json=payload
            )
            if resp.status_code not in (200, 201):
                raise HTTPException(
                    status_code=resp.status_code,
                    detail=f"Failed to create Bolna agent: {resp.text}"
                )
            return resp.json()

    async def make_call(
        self,
        recipient_phone_number: str,
        agent_id: Optional[str] = None,
        user_data: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Initiate an outbound call via Bolna.
        Requires manual approval and confirmation before invocation!
        """
        target_agent = agent_id or settings.BOLNA_AGENT_ID
        if not target_agent:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No Bolna agent ID configured. Please configure BOLNA_AGENT_ID."
            )

        payload = {
            "agent_id": target_agent,
            "recipient_phone_number": recipient_phone_number,
            "user_data": user_data or {}
        }

        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(
                f"{self.base_url}/call",
                headers=self._headers(),
                json=payload
            )
            if resp.status_code not in (200, 201):
                raise HTTPException(
                    status_code=resp.status_code,
                    detail=f"Failed to initiate call via Bolna: {resp.text}"
                )
            return resp.json()

    async def get_execution(self, execution_id: str) -> Dict[str, Any]:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(
                f"{self.base_url}/executions/{execution_id}",
                headers=self._headers()
            )
            if resp.status_code != 200:
                raise HTTPException(
                    status_code=resp.status_code,
                    detail=f"Failed to fetch execution: {resp.text}"
                )
            return resp.json()


bolna_client = BolnaClient()


class WebhookService:
    @staticmethod
    def process_bolna_webhook(db: Session, payload: Dict[str, Any]) -> Call:
        """
        Idempotently processes Bolna call execution updates.
        Bolna sends execution payload containing execution_id or id, status, duration, cost, etc.
        """
        execution_id = payload.get("execution_id") or payload.get("id")
        # Resolve workspace
        ws = db.query(Workspace).first()
        workspace_id = ws.id if ws else "default"

        if not execution_id:
            # Store event without execution id
            event = CallEvent(
                workspace_id=workspace_id,
                event_type="unknown",
                occurred_at=datetime.now(timezone.utc),
                payload_redacted={"raw": str(payload)[:1000]},
                processing_status="ignored_no_execution_id"
            )
            db.add(event)
            db.commit()
            return None

        status_val = payload.get("status", "unknown")
        agent_id = payload.get("agent_id")
        duration = payload.get("duration") or payload.get("duration_seconds") or 0
        cost = payload.get("cost") or payload.get("total_cost") or payload.get("cost_amount")

        transcript = payload.get("transcript") or payload.get("transcript_text")
        summary = payload.get("summary")
        recording_url = payload.get("recording_url") or payload.get("audio_url")
        termination_reason = payload.get("termination_reason") or payload.get("hangup_reason")

        call = db.query(Call).filter(Call.bolna_execution_id == execution_id).first()
        if not call:
            call = Call(
                workspace_id=workspace_id,
                bolna_execution_id=execution_id,
                bolna_agent_id=agent_id,
                channel="phone",
                status=status_val,
                duration_seconds=int(duration) if duration else 0,
                cost_amount=float(cost) if cost else None,
                summary=summary,
                transcript_text=transcript,
                recording_url=recording_url,
                termination_reason=termination_reason,
                started_at=datetime.now(timezone.utc),
                created_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc)
            )
            db.add(call)
            db.commit()
            db.refresh(call)
        else:
            # Idempotent update
            call.status = status_val
            if duration:
                call.duration_seconds = int(duration)
            if cost is not None:
                call.cost_amount = float(cost)
            if transcript:
                call.transcript_text = transcript
            if summary:
                call.summary = summary
            if recording_url:
                call.recording_url = recording_url
            if termination_reason:
                call.termination_reason = termination_reason
            if status_val in ("completed", "failed", "busy", "no-answer") and not call.ended_at:
                call.ended_at = datetime.now(timezone.utc)
            call.updated_at = datetime.now(timezone.utc)
            db.commit()
            db.refresh(call)

        # Log event
        event_id = payload.get("event_id") or f"{execution_id}_{status_val}_{datetime.now(timezone.utc).timestamp()}"
        existing_event = db.query(CallEvent).filter(CallEvent.provider_event_id == event_id).first()
        if not existing_event:
            event = CallEvent(
                workspace_id=call.workspace_id,
                call_id=call.id,
                provider_event_id=event_id,
                event_type=f"call_{status_val}",
                occurred_at=datetime.now(timezone.utc),
                payload_redacted={"status": status_val, "duration": duration, "execution_id": execution_id},
                processing_status="processed"
            )
            db.add(event)
            db.commit()

        return call
