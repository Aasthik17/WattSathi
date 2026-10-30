from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.asset import Asset
from app.models.site import Site
from app.models.call import Call
from app.schemas.bolna_tool import (
    GetAssetContextRequest,
    GetAssetContextResponse,
    SearchManualRequest,
    SearchManualResponse,
    SearchMatchItem,
    BolnaCreateWorkOrderRequest,
    BolnaCreateWorkOrderResponse
)
from app.schemas.work_order import WorkOrderCreate
from app.services.retrieval_service import RetrievalService
from app.services.work_order_service import WorkOrderService
from app.api.deps import require_bolna_tool_auth

router = APIRouter()

@router.post(
    "/get-asset-context",
    response_model=GetAssetContextResponse,
    dependencies=[Depends(require_bolna_tool_auth)]
)
def get_asset_context(
    req: GetAssetContextRequest,
    db: Session = Depends(get_db)
):
    query = db.query(Asset)
    if req.asset_id:
        query = query.filter(Asset.id == req.asset_id)
    elif req.asset_code:
        query = query.filter(Asset.asset_code == req.asset_code)
    else:
        # Default to first active asset if context is minimal
        query = query.filter(Asset.is_active == True)

    asset = query.first()
    if not asset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Asset context not found."
        )

    site = asset.site
    return GetAssetContextResponse(
        asset_id=asset.id,
        asset_code=asset.asset_code,
        category=asset.category,
        manufacturer=asset.manufacturer,
        model=asset.model,
        rated_capacity_kw=asset.rated_capacity_kw,
        site_id=site.id if site else "unknown",
        site_name=site.name if site else "Default Site",
        site_code=site.site_code if site else "SITE-01",
        notes=asset.notes
    )

@router.post(
    "/search-manual",
    response_model=SearchManualResponse,
    dependencies=[Depends(require_bolna_tool_auth)]
)
def search_manual(
    req: SearchManualRequest,
    db: Session = Depends(get_db)
):
    # Resolve asset & model if asset_code or asset_id given
    target_model = req.model
    target_site_id = req.site_id
    workspace_id = None

    if req.asset_id or req.asset_code:
        a_query = db.query(Asset)
        if req.asset_id:
            a_query = a_query.filter(Asset.id == req.asset_id)
        if req.asset_code:
            a_query = a_query.filter(Asset.asset_code == req.asset_code)
        asset = a_query.first()
        if asset:
            target_model = asset.model
            target_site_id = asset.site_id
            workspace_id = asset.workspace_id

    if not workspace_id:
        first_asset = db.query(Asset).first()
        workspace_id = first_asset.workspace_id if first_asset else "default"

    search_result = RetrievalService.search_manual(
        db=db,
        workspace_id=workspace_id,
        query=req.query,
        site_id=target_site_id,
        model=target_model
    )

    matches = [
        SearchMatchItem(
            document_id=m.document_id,
            source_title=m.source_title,
            page_or_section=m.page_or_section,
            excerpt=m.excerpt,
            evidence_level=m.evidence_level,
            is_simulated=m.is_simulated
        )
        for m in search_result.matches
    ]

    return SearchManualResponse(
        matches=matches,
        no_reliable_match=search_result.no_reliable_match,
        instruction=search_result.instruction
    )

@router.post(
    "/create-work-order",
    response_model=BolnaCreateWorkOrderResponse,
    dependencies=[Depends(require_bolna_tool_auth)]
)
def create_work_order_tool(
    req: BolnaCreateWorkOrderRequest,
    db: Session = Depends(get_db)
):
    """
    Bolna Voice Tool: Create Work Order.
    MANDATORY GUARD:
    Rejects request if caller_confirmed is False.
    """
    if not req.caller_confirmed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot create work order without caller's explicit verbal confirmation."
        )

    # Resolve asset
    asset = None
    if req.asset_id:
        asset = db.query(Asset).filter(Asset.id == req.asset_id).first()
    elif req.asset_code:
        asset = db.query(Asset).filter(Asset.asset_code == req.asset_code).first()
    else:
        asset = db.query(Asset).first()

    if not asset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Asset could not be resolved."
        )

    site_id = req.site_id or asset.site_id
    workspace_id = asset.workspace_id

    # Resolve call if call_execution_id provided
    call_id = None
    if req.call_execution_id:
        call = db.query(Call).filter(Call.bolna_execution_id == req.call_execution_id).first()
        if call:
            call_id = call.id

    obs_list = req.observations if isinstance(req.observations, list) else [req.observations]

    create_data = WorkOrderCreate(
        site_id=site_id,
        asset_id=asset.id,
        call_id=call_id,
        issue_title=req.issue_title,
        observations=obs_list,
        suspected_cause=req.suspected_cause,
        evidence_refs=req.evidence_document_ids or [],
        recommended_safe_next_step=req.recommended_safe_next_step,
        priority=req.priority or "normal",
        caller_confirmed=True,
        idempotency_key=req.idempotency_key
    )

    wo = WorkOrderService.create_work_order(
        db=db,
        workspace_id=workspace_id,
        data=create_data
    )

    return BolnaCreateWorkOrderResponse(
        work_order_id=wo.id,
        work_order_number=wo.work_order_number,
        status=wo.status,
        message=f"Work order {wo.work_order_number} created successfully. Please read this ticket number back to the caller.",
        caller_confirmed=True
    )

