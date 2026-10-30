from typing import List
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.site import Site
from app.models.user import User
from app.schemas.site import SiteCreate, SiteUpdate, SiteOut
from app.api.deps import get_current_user

router = APIRouter()

@router.get("", response_model=List[SiteOut])
def list_sites(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    sites = db.query(Site).filter(Site.workspace_id == current_user.workspace_id).all()
    out = []
    for s in sites:
        item = SiteOut.model_validate(s)
        item.asset_count = len(s.assets)
        out.append(item)
    return out

@router.post("", response_model=SiteOut)
def create_site(
    site_in: SiteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    existing = db.query(Site).filter(
        Site.workspace_id == current_user.workspace_id,
        Site.site_code == site_in.site_code
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Site with code '{site_in.site_code}' already exists."
        )

    site = Site(
        workspace_id=current_user.workspace_id,
        **site_in.model_dump()
    )
    db.add(site)
    db.commit()
    db.refresh(site)
    res = SiteOut.model_validate(site)
    res.asset_count = 0
    return res

@router.get("/{site_id}", response_model=SiteOut)
def get_site(
    site_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    site = db.query(Site).filter(
        Site.id == site_id,
        Site.workspace_id == current_user.workspace_id
    ).first()
    if not site:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Site not found.")
    res = SiteOut.model_validate(site)
    res.asset_count = len(site.assets)
    return res

@router.patch("/{site_id}", response_model=SiteOut)
def update_site(
    site_id: str,
    update_in: SiteUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    site = db.query(Site).filter(
        Site.id == site_id,
        Site.workspace_id == current_user.workspace_id
    ).first()
    if not site:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Site not found.")

    for field, val in update_in.model_dump(exclude_unset=True).items():
        setattr(site, field, val)

    site.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(site)
    res = SiteOut.model_validate(site)
    res.asset_count = len(site.assets)
    return res

@router.delete("/{site_id}")
def delete_site(
    site_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    site = db.query(Site).filter(
        Site.id == site_id,
        Site.workspace_id == current_user.workspace_id
    ).first()
    if not site:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Site not found.")

    db.delete(site)
    db.commit()
    return {"message": "Site deleted successfully."}

