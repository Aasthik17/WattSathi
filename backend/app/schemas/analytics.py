from typing import Optional
from pydantic import BaseModel

class AnalyticsOverview(BaseModel):
    active_sites: int
    active_assets: int
    open_work_orders: int
    total_calls: int
    calls_this_week: int
    ready_documents: int
    failed_documents: int
    bolna_connected: bool
    bolna_agent_id: Optional[str] = None
    wallet_balance: Optional[float] = None

