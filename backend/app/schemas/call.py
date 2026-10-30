from datetime import datetime
from typing import Optional, List, Any
from pydantic import BaseModel, Field, ConfigDict

class CallOut(BaseModel):
    id: str
    workspace_id: str
    bolna_execution_id: Optional[str] = None
    bolna_agent_id: Optional[str] = None
    site_id: Optional[str] = None
    asset_id: Optional[str] = None
    initiated_by: Optional[str] = None
    channel: str
    language: str
    status: str
    started_at: Optional[datetime] = None
    ended_at: Optional[datetime] = None
    duration_seconds: int
    cost_amount: Optional[float] = None
    cost_currency: Optional[str] = None
    summary: Optional[str] = None
    recording_url: Optional[str] = None
    termination_reason: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    site_name: Optional[str] = None
    asset_code: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class CallDetailOut(CallOut):
    transcript_text: Optional[str] = None
    work_orders: List[Any] = []

class TestCallRequest(BaseModel):
    recipient_phone_number: str
    site_id: str
    asset_id: str
    explicit_cost_confirmed: bool = Field(
        ...,
        description="Explicit user confirmation that placing this call consumes account credit"
    )

class TestCallResponse(BaseModel):
    call_id: str
    execution_id: str
    status: str
    message: str
