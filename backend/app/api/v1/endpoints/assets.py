from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.asset import Asset
from app.models.site import Site
from app.models.user import User
from app.schemas.asset import AssetCreate, AssetUpdate, AssetOut
from app.api.deps import get_current_user

router = APIRouter()

@router.get("", response_model=List[AssetOut])
def list_assets(
    site_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Asset).filter(Asset.workspace_id == current_user.workspace_id)
    if site_id:
        query = query.filter(Asset.site_id == site_id)
    assets = query.all()

    out = []
    for a in assets:
        item = AssetOut.model_validate(a)
        item.site_name = a.site.name if a.site else None
        out.append(item)
    return out

@router.post("", response_model=AssetOut)
def create_asset(
    asset_in: AssetCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify site belongs to workspace
    site = db.query(Site).filter(
        Site.id == asset_in.site_id,
        Site.workspace_id == current_user.workspace_id
    ).first()
    if not site:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Site not found.")

    existing = db.query(Asset).filter(
        Asset.workspace_id == current_user.workspace_id,
        Asset.asset_code == asset_in.asset_code
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Asset code '{asset_in.asset_code}' already exists in workspace."
        )

    asset = Asset(
        workspace_id=current_user.workspace_id,
        **asset_in.model_dump()
    )
    db.add(asset)
    db.commit()
    db.refresh(asset)

    res = AssetOut.model_validate(asset)
    res.site_name = site.name
    return res

@router.get("/{asset_id}", response_model=AssetOut)
def get_asset(
    asset_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    asset = db.query(Asset).filter(
        Asset.id == asset_id,
        Asset.workspace_id == current_user.workspace_id
    ).first()
    if not asset:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Asset not found.")

    res = AssetOut.model_validate(asset)
    res.site_name = asset.site.name if asset.site else None
    return res

@router.patch("/{asset_id}", response_model=AssetOut)
def update_asset(
    asset_id: str,
    update_in: AssetUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    asset = db.query(Asset).filter(
        Asset.id == asset_id,
        Asset.workspace_id == current_user.workspace_id
    ).first()
    if not asset:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Asset not found.")

    data = update_in.model_dump(exclude_unset=True)
    if "site_id" in data:
        site = db.query(Site).filter(
            Site.id == data["site_id"],
            Site.workspace_id == current_user.workspace_id
        ).first()
        if not site:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="New site not found.")

    for field, val in data.items():
        setattr(asset, field, val)

    asset.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(asset)

    res = AssetOut.model_validate(asset)
    res.site_name = asset.site.name if asset.site else None
    return res

@router.delete("/{asset_id}")
def delete_asset(
    asset_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    asset = db.query(Asset).filter(
        Asset.id == asset_id,
        Asset.workspace_id == current_user.workspace_id
    ).first()
    if not asset:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Asset not found.")

    db.delete(asset)
    db.commit()
    return {"message": "Asset deleted successfully."}

