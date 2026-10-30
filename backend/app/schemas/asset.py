from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

class AssetBase(BaseModel):
    site_id: str
    asset_code: str
    category: str = "inverter"
    manufacturer: str
    model: str
    serial_number: Optional[str] = None
    rated_capacity_kw: Optional[float] = None
    installed_on: Optional[datetime] = None
    warranty_end_date: Optional[datetime] = None
    notes: Optional[str] = None
    is_active: bool = True

class AssetCreate(AssetBase):
    pass

class AssetUpdate(BaseModel):
    site_id: Optional[str] = None
    asset_code: Optional[str] = None
    category: Optional[str] = None
    manufacturer: Optional[str] = None
    model: Optional[str] = None
    serial_number: Optional[str] = None
    rated_capacity_kw: Optional[float] = None
    installed_on: Optional[datetime] = None
    warranty_end_date: Optional[datetime] = None
    notes: Optional[str] = None
    is_active: Optional[bool] = None

class AssetOut(AssetBase):
    id: str
    workspace_id: str
    created_at: datetime
    updated_at: datetime
    site_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
