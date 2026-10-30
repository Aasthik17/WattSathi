from typing import Optional, List, Union, Any
from pydantic import BaseModel, Field

class GetAssetContextRequest(BaseModel):
    asset_code: Optional[str] = None
    asset_id: Optional[str] = None
    site_id: Optional[str] = None

class GetAssetContextResponse(BaseModel):
    asset_id: str
    asset_code: str
    category: str
    manufacturer: str
    model: str
    rated_capacity_kw: Optional[float] = None
    site_id: str
    site_name: str
    site_code: str
    notes: Optional[str] = None

class SearchManualRequest(BaseModel):
    query: str
    asset_id: Optional[str] = None
    asset_code: Optional[str] = None
    model: Optional[str] = None
    site_id: Optional[str] = None
    language: Optional[str] = "hi-Latn"

class SearchMatchItem(BaseModel):
    document_id: str
    source_title: str
    page_or_section: str
    excerpt: str
    evidence_level: str = "source_backed"
    is_simulated: bool = False

class SearchManualResponse(BaseModel):
    matches: List[SearchMatchItem]
    no_reliable_match: bool
    instruction: str

class BolnaCreateWorkOrderRequest(BaseModel):
    site_id: Optional[str] = None
    asset_id: Optional[str] = None
    asset_code: Optional[str] = None
    issue_title: str
    observations: Union[List[str], str] = []
    suspected_cause: Optional[str] = None
    evidence_document_ids: Optional[List[str]] = None
    recommended_safe_next_step: str = "Escalate to qualified engineer for on-site inspection."
    priority: str = "normal"
    caller_confirmed: bool = Field(
        ...,
        description="Explicit verbal confirmation from the technician before work order creation"
    )
    call_execution_id: Optional[str] = None
    idempotency_key: Optional[str] = None

class BolnaCreateWorkOrderResponse(BaseModel):
    work_order_id: str
    work_order_number: str
    status: str
    message: str
    caller_confirmed: bool

