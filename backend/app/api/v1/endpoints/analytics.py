from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.config import settings
from app.models.site import Site
from app.models.asset import Asset
from app.models.work_order import WorkOrder
from app.models.call import Call
from app.models.document import Document
from app.models.user import User
from app.schemas.analytics import AnalyticsOverview
from app.services.bolna_service import bolna_client
from app.api.deps import get_current_user

router = APIRouter()

@router.get("/overview", response_model=AnalyticsOverview)
async def get_overview(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    ws_id = current_user.workspace_id

    active_sites = db.query(Site).filter(Site.workspace_id == ws_id).count()
    active_assets = db.query(Asset).filter(Asset.workspace_id == ws_id, Asset.is_active == True).count()
    open_work_orders = db.query(WorkOrder).filter(
        WorkOrder.workspace_id == ws_id,
        WorkOrder.status.in_(["open", "in_progress", "pending_human_review"])
    ).count()

    one_week_ago = datetime.now(timezone.utc) - timedelta(days=7)
    total_calls = db.query(Call).filter(Call.workspace_id == ws_id).count()
    calls_this_week = db.query(Call).filter(
        Call.workspace_id == ws_id,
        Call.created_at >= one_week_ago
    ).count()

    ready_documents = db.query(Document).filter(
        Document.workspace_id == ws_id,
        Document.status == "ready"
    ).count()
    failed_documents = db.query(Document).filter(
        Document.workspace_id == ws_id,
        Document.status == "failed"
    ).count()

    wallet_balance = None
    if bolna_client.is_configured:
        try:
            me_data = await bolna_client.get_me()
            wallet_balance = me_data.get("wallet")
        except Exception:
            wallet_balance = None

    return AnalyticsOverview(
        active_sites=active_sites,
        active_assets=active_assets,
        open_work_orders=open_work_orders,
        total_calls=total_calls,
        calls_this_week=calls_this_week,
        ready_documents=ready_documents,
        failed_documents=failed_documents,
        bolna_connected=bolna_client.is_configured,
        bolna_agent_id=settings.BOLNA_AGENT_ID if settings.BOLNA_AGENT_ID else None,
        wallet_balance=wallet_balance
    )

