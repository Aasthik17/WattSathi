from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.work_order import WorkOrder
from app.models.user import User
from app.schemas.work_order import WorkOrderCreate, WorkOrderUpdate, WorkOrderOut, HumanVerifyRequest
from app.services.work_order_service import WorkOrderService
from app.api.deps import get_current_user

router = APIRouter()

@router.get("", response_model=List[WorkOrderOut])
def list_work_orders(
    status_filter: Optional[str] = Query(None, alias="status"),
    priority_filter: Optional[str] = Query(None, alias="priority"),
    site_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(WorkOrder).filter(WorkOrder.workspace_id == current_user.workspace_id)
    if status_filter:
        query = query.filter(WorkOrder.status == status_filter)
    if priority_filter:
        query = query.filter(WorkOrder.priority == priority_filter)
    if site_id:
        query = query.filter(WorkOrder.site_id == site_id)

    orders = query.order_by(WorkOrder.created_at.desc()).all()
    out = []
    for wo in orders:
        item = WorkOrderOut.model_validate(wo)
        item.site_name = wo.site.name if wo.site else None
        item.asset_code = wo.asset.asset_code if wo.asset else None
        item.asset_model = wo.asset.model if wo.asset else None
        out.append(item)
    return out

@router.post("", response_model=WorkOrderOut)
def create_work_order(
    data: WorkOrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    wo = WorkOrderService.create_work_order(
        db=db,
        workspace_id=current_user.workspace_id,
        data=data,
        created_by_user_id=current_user.id
    )
    res = WorkOrderOut.model_validate(wo)
    res.site_name = wo.site.name if wo.site else None
    res.asset_code = wo.asset.asset_code if wo.asset else None
    res.asset_model = wo.asset.model if wo.asset else None
    return res

@router.get("/{work_order_id}", response_model=WorkOrderOut)
def get_work_order(
    work_order_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    wo = db.query(WorkOrder).filter(
        WorkOrder.id == work_order_id,
        WorkOrder.workspace_id == current_user.workspace_id
    ).first()
    if not wo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Work order not found.")

    res = WorkOrderOut.model_validate(wo)
    res.site_name = wo.site.name if wo.site else None
    res.asset_code = wo.asset.asset_code if wo.asset else None
    res.asset_model = wo.asset.model if wo.asset else None
    return res

@router.patch("/{work_order_id}", response_model=WorkOrderOut)
def update_work_order(
    work_order_id: str,
    update_in: WorkOrderUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    wo = db.query(WorkOrder).filter(
        WorkOrder.id == work_order_id,
        WorkOrder.workspace_id == current_user.workspace_id
    ).first()
    if not wo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Work order not found.")

    for field, val in update_in.model_dump(exclude_unset=True).items():
        setattr(wo, field, val)

    db.commit()
    db.refresh(wo)

    res = WorkOrderOut.model_validate(wo)
    res.site_name = wo.site.name if wo.site else None
    res.asset_code = wo.asset.asset_code if wo.asset else None
    res.asset_model = wo.asset.model if wo.asset else None
    return res

@router.post("/{work_order_id}/verify", response_model=WorkOrderOut)
def human_verify(
    work_order_id: str,
    verify_req: HumanVerifyRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Mandatory rule: Only a human engineer/manager can certify or verify root cause.
    """
    wo = WorkOrderService.human_verify_work_order(
        db=db,
        workspace_id=current_user.workspace_id,
        work_order_id=work_order_id,
        user_id=current_user.id,
        verified_cause=verify_req.verified_cause,
        notes=verify_req.notes
    )

    res = WorkOrderOut.model_validate(wo)
    res.site_name = wo.site.name if wo.site else None
    res.asset_code = wo.asset.asset_code if wo.asset else None
    res.asset_model = wo.asset.model if wo.asset else None
    return res

