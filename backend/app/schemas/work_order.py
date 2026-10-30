from datetime import datetime
from typing import Optional, List, Any
from pydantic import BaseModel, ConfigDict

class WorkOrderCreate(BaseModel):
    site_id: str
    asset_id: str
    call_id: Optional[str] = None
    issue_title: str
    observations: List[str] = []
    suspected_cause: Optional[str] = None
    evidence_refs: List[Any] = []
    recommended_safe_next_step: str
    priority: str = "normal"
    caller_confirmed: bool = True
    idempotency_key: Optional[str] = None

class WorkOrderUpdate(BaseModel):
    status: Optional[str] = None
    priority: Optional[str] = None
    assigned_to: Optional[str] = None
    suspected_cause: Optional[str] = None
    recommended_safe_next_step: Optional[str] = None

class HumanVerifyRequest(BaseModel):
    verified_cause: str
    notes: Optional[str] = None

class WorkOrderOut(BaseModel):
    id: str
    workspace_id: str
    work_order_number: str
    site_id: str
    asset_id: str
    call_id: Optional[str] = None
    created_by: Optional[str] = None
    assigned_to: Optional[str] = None
    issue_title: str
    observations: List[Any] = []
    suspected_cause: Optional[str] = None
    evidence_refs: List[Any] = []
    recommended_safe_next_step: str
    priority: str
    status: str
    diagnosis_state: str
    caller_confirmed_at: Optional[datetime] = None
    human_verified_by: Optional[str] = None
    human_verified_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    site_name: Optional[str] = None
    asset_code: Optional[str] = None
    asset_model: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
