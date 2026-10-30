import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

class WorkOrder(Base):
    __tablename__ = "work_orders"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    workspace_id = Column(String(36), ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False, index=True)
    work_order_number = Column(String(50), nullable=False, unique=True, index=True)
    site_id = Column(String(36), ForeignKey("sites.id", ondelete="CASCADE"), nullable=False, index=True)
    asset_id = Column(String(36), ForeignKey("assets.id", ondelete="CASCADE"), nullable=False, index=True)
    call_id = Column(String(36), ForeignKey("calls.id", ondelete="SET NULL"), nullable=True, index=True)
    created_by = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    assigned_to = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    issue_title = Column(String(255), nullable=False)
    observations = Column(JSON, nullable=False, default=list)
    suspected_cause = Column(Text, nullable=True)
    evidence_refs = Column(JSON, nullable=False, default=list)
    recommended_safe_next_step = Column(Text, nullable=False)
    priority = Column(String(50), default="normal", nullable=False)  # low, normal, high, urgent
    status = Column(String(50), default="open", nullable=False)  # open, in_progress, pending_human_review, resolved, closed
    diagnosis_state = Column(String(50), default="unverified", nullable=False)  # unverified, human_verified, not_applicable
    caller_confirmed_at = Column(DateTime, nullable=True)
    human_verified_by = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    human_verified_at = Column(DateTime, nullable=True)
    idempotency_key = Column(String(255), unique=True, nullable=True, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    workspace = relationship("Workspace", back_populates="work_orders")
    site = relationship("Site", back_populates="work_orders")
    asset = relationship("Asset", back_populates="work_orders")
    call = relationship("Call", back_populates="work_orders")

