from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.call import Call
from app.models.site import Site
from app.models.asset import Asset
from app.models.user import User
from app.schemas.call import CallOut, CallDetailOut, TestCallRequest, TestCallResponse
from app.services.bolna_service import bolna_client
from app.api.deps import get_current_user

router = APIRouter()

@router.get("", response_model=List[CallOut])
def list_calls(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    calls = db.query(Call).filter(
        Call.workspace_id == current_user.workspace_id
    ).order_by(Call.created_at.desc()).all()

    out = []
    for c in calls:
        item = CallOut.model_validate(c)
        item.site_name = c.site.name if c.site else None
        item.asset_code = c.asset.asset_code if c.asset else None
        out.append(item)
    return out

@router.get("/{call_id}", response_model=CallDetailOut)
def get_call(
    call_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    call = db.query(Call).filter(
        (Call.id == call_id) | (Call.bolna_execution_id == call_id),
        Call.workspace_id == current_user.workspace_id
    ).first()
    if not call:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Call record not found.")

    res = CallDetailOut.model_validate(call)
    res.site_name = call.site.name if call.site else None
    res.asset_code = call.asset.asset_code if call.asset else None
    res.work_orders = [wo.work_order_number for wo in call.work_orders]
    return res

@router.post("/test", response_model=TestCallResponse)
async def initiate_test_call(
    req: TestCallRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Initiate an outbound test call.
    MANDATORY RULE:
    Requires explicit manual confirmation (explicit_cost_confirmed=True).
    No automatic calls, no loops, at most one manual call.
    """
    if not req.explicit_cost_confirmed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Test call aborted. Explicit confirmation of Bolna credit expenditure is required."
        )

    # Validate asset & site
    asset = db.query(Asset).filter(
        Asset.id == req.asset_id,
        Asset.workspace_id == current_user.workspace_id
    ).first()
    if not asset:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Asset not found.")

    site = db.query(Site).filter(
        Site.id == req.site_id,
        Site.workspace_id == current_user.workspace_id
    ).first()
    if not site:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Site not found.")

    # Format user_data for Bolna prompt variables
    user_data = {
        "technician_name": current_user.display_name,
        "site_name": site.name,
        "site_code": site.site_code,
        "asset_code": asset.asset_code,
        "asset_model": asset.model,
        "manufacturer": asset.manufacturer
    }

    try:
        bolna_resp = await bolna_client.make_call(
            recipient_phone_number=req.recipient_phone_number,
            user_data=user_data
        )
        execution_id = bolna_resp.get("execution_id")

        call = Call(
            workspace_id=current_user.workspace_id,
            bolna_execution_id=execution_id,
            site_id=site.id,
            asset_id=asset.id,
            initiated_by=current_user.id,
            channel="phone",
            language="hi-Latn",
            status="queued",
            started_at=datetime.now(timezone.utc),
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        db.add(call)
        db.commit()
        db.refresh(call)

        return TestCallResponse(
            call_id=call.id,
            execution_id=execution_id or "pending",
            status="queued",
            message=f"Test call successfully queued for {req.recipient_phone_number}."
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Bolna outbound call failed: {str(e)}"
        )

