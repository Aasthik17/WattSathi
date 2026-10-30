import uuid
import secrets
from datetime import datetime, timezone
from typing import Optional, List, Any
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.work_order import WorkOrder
from app.models.asset import Asset
from app.models.site import Site
from app.models.call import Call
from app.schemas.work_order import WorkOrderCreate

class WorkOrderService:
    @staticmethod
    def generate_wo_number(db: Session, workspace_id: str) -> str:
        date_str = datetime.now(timezone.utc).strftime("%Y%m%d")
        random_suffix = secrets.token_hex(2).upper()
        count = db.query(WorkOrder).filter(WorkOrder.workspace_id == workspace_id).count() + 1
        return f"WO-{date_str}-{count:03d}-{random_suffix}"

    @classmethod
    def create_work_order(
        cls,
        db: Session,
        workspace_id: str,
        data: WorkOrderCreate,
        created_by_user_id: Optional[str] = None
    ) -> WorkOrder:
        # Enforce caller confirmation
        if not data.caller_confirmed:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Work order creation requires explicit verbal or written caller confirmation."
            )

        # Check idempotency
        if data.idempotency_key:
            existing = db.query(WorkOrder).filter(
                WorkOrder.workspace_id == workspace_id,
                WorkOrder.idempotency_key == data.idempotency_key
            ).first()
            if existing:
                return existing

        # Validate asset and site
        asset = db.query(Asset).filter(
            Asset.id == data.asset_id,
            Asset.workspace_id == workspace_id
        ).first()
        if not asset:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Asset not found in workspace."
            )
        if asset.site_id != data.site_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Asset does not belong to the specified site."
            )

        wo_number = cls.generate_wo_number(db, workspace_id)

        # Observations list normalized
        obs = data.observations if isinstance(data.observations, list) else [str(data.observations)]

        wo = WorkOrder(
            workspace_id=workspace_id,
            work_order_number=wo_number,
            site_id=data.site_id,
            asset_id=data.asset_id,
            call_id=data.call_id,
            created_by=created_by_user_id,
            issue_title=data.issue_title,
            observations=obs,
            suspected_cause=data.suspected_cause,
            evidence_refs=data.evidence_refs,
            recommended_safe_next_step=data.recommended_safe_next_step,
            priority=data.priority or "normal",
            status="open",
            diagnosis_state="unverified",
            caller_confirmed_at=datetime.now(timezone.utc),
            idempotency_key=data.idempotency_key,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        db.add(wo)
        db.commit()
        db.refresh(wo)
        return wo

    @staticmethod
    def human_verify_work_order(
        db: Session,
        workspace_id: str,
        work_order_id: str,
        user_id: str,
        verified_cause: str,
        notes: Optional[str] = None
    ) -> WorkOrder:
        wo = db.query(WorkOrder).filter(
            WorkOrder.id == work_order_id,
            WorkOrder.workspace_id == workspace_id
        ).first()
        if not wo:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Work order not found."
            )

        wo.diagnosis_state = "human_verified"
        wo.suspected_cause = verified_cause
        wo.human_verified_by = user_id
        wo.human_verified_at = datetime.now(timezone.utc)
        wo.updated_at = datetime.now(timezone.utc)

        if notes:
            obs = list(wo.observations or [])
            obs.append(f"Human engineer verification: {notes}")
            wo.observations = obs

        db.commit()
        db.refresh(wo)
        return wo

