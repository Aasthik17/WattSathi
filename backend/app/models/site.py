import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class Site(Base):
    __tablename__ = "sites"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    workspace_id = Column(String(36), ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False, index=True)
    site_code = Column(String(100), nullable=False)
    name = Column(String(255), nullable=False)
    address_text = Column(Text, nullable=True)
    timezone = Column(String(100), default="Asia/Kolkata", nullable=False)
    contact_name = Column(String(255), nullable=True)
    contact_phone = Column(String(50), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    workspace = relationship("Workspace", back_populates="sites")
    assets = relationship("Asset", back_populates="site", cascade="all, delete-orphan")
    documents = relationship("Document", back_populates="site")
    work_orders = relationship("WorkOrder", back_populates="site")
    calls = relationship("Call", back_populates="site")

