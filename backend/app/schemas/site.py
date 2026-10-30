from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

class SiteBase(BaseModel):
    site_code: str
    name: str
    address_text: Optional[str] = None
    timezone: str = "Asia/Kolkata"
    contact_name: Optional[str] = None
    contact_phone: Optional[str] = None
    notes: Optional[str] = None

class SiteCreate(SiteBase):
    pass

class SiteUpdate(BaseModel):
    site_code: Optional[str] = None
    name: Optional[str] = None
    address_text: Optional[str] = None
    timezone: Optional[str] = None
    contact_name: Optional[str] = None
    contact_phone: Optional[str] = None
    notes: Optional[str] = None

class SiteOut(SiteBase):
    id: str
    workspace_id: str
    created_at: datetime
    updated_at: datetime
    asset_count: Optional[int] = 0

    model_config = ConfigDict(from_attributes=True)
