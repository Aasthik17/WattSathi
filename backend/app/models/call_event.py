import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

class CallEvent(Base):
    __tablename__ = "call_events"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    workspace_id = Column(String(36), ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False, index=True)
    call_id = Column(String(36), ForeignKey("calls.id", ondelete="CASCADE"), nullable=True, index=True)
    provider_event_id = Column(String(255), unique=True, nullable=True, index=True)
    event_type = Column(String(100), nullable=False)
    occurred_at = Column(DateTime, nullable=True)
    received_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    payload_redacted = Column(JSON, nullable=True)
    processing_status = Column(String(50), default="processed", nullable=False)
    error_summary = Column(Text, nullable=True)

    call = relationship("Call", back_populates="events")

