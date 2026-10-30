import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, Float, Boolean, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.core.database import Base

class Asset(Base):
    __tablename__ = "assets"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    workspace_id = Column(String(36), ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False, index=True)
    site_id = Column(String(36), ForeignKey("sites.id", ondelete="CASCADE"), nullable=False, index=True)
    asset_code = Column(String(100), nullable=False)
    category = Column(String(100), default="inverter", nullable=False)  # inverter, panel, meter, battery
    manufacturer = Column(String(255), nullable=False)
    model = Column(String(255), nullable=False)
    serial_number = Column(String(255), nullable=True)
    rated_capacity_kw = Column(Float, nullable=True)
    installed_on = Column(DateTime, nullable=True)
    warranty_end_date = Column(DateTime, nullable=True)
    notes = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    __table_args__ = (
        UniqueConstraint("workspace_id", "asset_code", name="uq_workspace_asset_code"),
    )

    workspace = relationship("Workspace", back_populates="assets")
    site = relationship("Site", back_populates="assets")
    work_orders = relationship("WorkOrder", back_populates="asset")
    calls = relationship("Call", back_populates="asset")

