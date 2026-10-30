import os
from datetime import datetime, timezone
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import get_password_hash
from app.models.workspace import Workspace
from app.models.user import User
from app.models.site import Site
from app.models.asset import Asset
from app.models.document import Document
from app.services.document_service import DocumentService

class SeedService:
    @classmethod
    def seed_demo_data(cls, db: Session) -> dict:
        # 1. Workspace
        workspace = db.query(Workspace).filter(Workspace.name == "WattSathi Demo Workspace").first()
        if not workspace:
            workspace = Workspace(name="WattSathi Demo Workspace")
            db.add(workspace)
            db.commit()
            db.refresh(workspace)

        # 2. Admin User
        admin_user = db.query(User).filter(User.email == settings.ADMIN_EMAIL).first()
        if not admin_user:
            admin_user = User(
                workspace_id=workspace.id,
                email=settings.ADMIN_EMAIL,
                password_hash=get_password_hash(settings.ADMIN_PASSWORD),
                display_name="Operations Lead (Demo)",
                role="admin",
                is_active=True
            )
            db.add(admin_user)
            db.commit()
            db.refresh(admin_user)

        # 3. Demo Site
        site = db.query(Site).filter(
            Site.workspace_id == workspace.id,
            Site.site_code == "SITE-ROOFTOP-01"
        ).first()
        if not site:
            site = Site(
                workspace_id=workspace.id,
                site_code="SITE-ROOFTOP-01",
                name="Demo Solar Rooftop (Training Site)",
                address_text="Plot 42, Sector 18, Industrial Area, Gurugram, Haryana",
                timezone="Asia/Kolkata",
                contact_name="Ramesh Sharma (Field Lead)",
                contact_phone="+919876543210",
                notes="Simulated commercial rooftop solar training installation (15 kW total)."
            )
            db.add(site)
            db.commit()
            db.refresh(site)

        # 4. Demo Asset (DemoVolt DV-3K-SIM)
        asset = db.query(Asset).filter(
            Asset.workspace_id == workspace.id,
            Asset.asset_code == "WS-DEMO-001"
        ).first()
        if not asset:
            asset = Asset(
                workspace_id=workspace.id,
                site_id=site.id,
                asset_code="WS-DEMO-001",
                category="inverter",
                manufacturer="DemoVolt",
                model="DV-3K-SIM",
                serial_number="DV-2026-SIM-9988",
                rated_capacity_kw=3.0,
                installed_on=datetime(2025, 6, 15, tzinfo=timezone.utc),
                warranty_end_date=datetime(2030, 6, 14, tzinfo=timezone.utc),
                notes="Fictional simulated training inverter for voice troubleshooting validation.",
                is_active=True
            )
            db.add(asset)
            db.commit()
            db.refresh(asset)

        # 5. Ingest Demo Manual from fixtures/demo_manual.md
        # Try both repo-relative and absolute paths
        possible_paths = [
            os.path.join(os.getcwd(), "fixtures", "demo_manual.md"),
            os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))), "fixtures", "demo_manual.md"),
            "/Users/aasthikupadhyay/Desktop/WattSathi/fixtures/demo_manual.md"
        ]
        demo_manual_path = next((p for p in possible_paths if os.path.exists(p)), None)
        doc = db.query(Document).filter(
            Document.workspace_id == workspace.id,
            Document.title == "DemoVolt DV-3K-SIM Training Manual (Simulated)"
        ).first()

        if not doc and demo_manual_path and os.path.exists(demo_manual_path):
            with open(demo_manual_path, "rb") as f:
                file_bytes = f.read()

            doc = DocumentService.process_and_save_document(
                db=db,
                workspace_id=workspace.id,
                title="DemoVolt DV-3K-SIM Training Manual (Simulated)",
                original_filename="demo_manual.md",
                mime_type="text/markdown",
                file_bytes=file_bytes,
                site_id=site.id,
                document_type="manufacturer_manual",
                is_simulated=True,
                uploaded_by=admin_user.id,
                asset_model_scope="DV-3K-SIM"
            )

        return {
            "workspace_id": workspace.id,
            "admin_email": admin_user.email,
            "site_id": site.id,
            "asset_id": asset.id,
            "asset_code": asset.asset_code,
            "document_id": doc.id if doc else None
        }
