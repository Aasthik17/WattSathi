import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, Integer, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class Call(Base):
    __tablename__ = "calls"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    workspace_id = Column(String(36), ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False, index=True)
    bolna_execution_id = Column(String(255), unique=True, nullable=True, index=True)
    bolna_agent_id = Column(String(255), nullable=True, index=True)
    site_id = Column(String(36), ForeignKey("sites.id", ondelete="SET NULL"), nullable=True, index=True)
    asset_id = Column(String(36), ForeignKey("assets.id", ondelete="SET NULL"), nullable=True, index=True)
    initiated_by = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    channel = Column(String(50), default="web", nullable=False)  # web, phone, unknown
    language = Column(String(50), default="hi-Latn", nullable=False)
    status = Column(String(50), default="initialized", nullable=False)  # initialized, ringing, in-progress, completed, failed, busy, no-answer
    started_at = Column(DateTime, nullable=True)
    ended_at = Column(DateTime, nullable=True)
    duration_seconds = Column(Integer, default=0, nullable=False)
    cost_amount = Column(Float, nullable=True)
    cost_currency = Column(String(10), default="USD", nullable=True)
    summary = Column(Text, nullable=True)
    transcript_text = Column(Text, nullable=True)
    recording_url = Column(String(500), nullable=True)
    termination_reason = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    workspace = relationship("Workspace", back_populates="calls")
    site = relationship("Site", back_populates="calls")
    asset = relationship("Asset", back_populates="calls")
    events = relationship("CallEvent", back_populates="call", cascade="all, delete-orphan")
    work_orders = relationship("WorkOrder", back_populates="call")

