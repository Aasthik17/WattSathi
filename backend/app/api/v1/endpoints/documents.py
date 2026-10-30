import os
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.config import settings
from app.models.document import Document
from app.models.user import User
from app.schemas.document import DocumentOut, DocumentDetailOut, SearchResponse, ChunkOut
from app.services.document_service import DocumentService
from app.services.retrieval_service import RetrievalService
from app.api.deps import get_current_user

router = APIRouter()

@router.get("", response_model=List[DocumentOut])
def list_documents(
    site_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Document).filter(Document.workspace_id == current_user.workspace_id)
    if site_id:
        query = query.filter(Document.site_id == site_id)
    docs = query.order_by(Document.created_at.desc()).all()

    out = []
    for d in docs:
        item = DocumentOut.model_validate(d)
        item.chunk_count = len(d.chunks)
        out.append(item)
    return out

@router.post("", response_model=DocumentOut)
async def upload_document(
    file: UploadFile = File(...),
    title: str = Form(...),
    site_id: Optional[str] = Form(None),
    document_type: str = Form("manufacturer_manual"),
    is_simulated: bool = Form(False),
    asset_model_scope: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Validate file size
    file_bytes = await file.read()
    size_mb = len(file_bytes) / (1024 * 1024)
    if size_mb > settings.MAX_UPLOAD_MB:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds maximum allowed size of {settings.MAX_UPLOAD_MB}MB."
        )

    # Allowed extensions
    ext = os.path.splitext(file.filename or "")[1].lower()
    allowed_exts = [".pdf", ".docx", ".txt", ".md"]
    if ext not in allowed_exts:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format '{ext}'. Allowed: PDF, DOCX, TXT, MD."
        )

    mime_type = file.content_type or "application/octet-stream"
    if ext == ".pdf":
        mime_type = "application/pdf"
    elif ext in (".md", ".txt"):
        mime_type = "text/markdown" if ext == ".md" else "text/plain"

    doc = DocumentService.process_and_save_document(
        db=db,
        workspace_id=current_user.workspace_id,
        title=title,
        original_filename=file.filename or "uploaded_doc",
        mime_type=mime_type,
        file_bytes=file_bytes,
        site_id=site_id if site_id else None,
        document_type=document_type,
        is_simulated=is_simulated,
        uploaded_by=current_user.id,
        asset_model_scope=asset_model_scope
    )

    res = DocumentOut.model_validate(doc)
    res.chunk_count = len(doc.chunks)
    return res

@router.get("/{document_id}", response_model=DocumentDetailOut)
def get_document(
    document_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    doc = db.query(Document).filter(
        Document.id == document_id,
        Document.workspace_id == current_user.workspace_id
    ).first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found.")

    res = DocumentDetailOut.model_validate(doc)
    res.chunk_count = len(doc.chunks)
    res.chunks = [ChunkOut.model_validate(c) for c in doc.chunks]
    return res

@router.delete("/{document_id}")
def delete_document(
    document_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    doc = db.query(Document).filter(
        Document.id == document_id,
        Document.workspace_id == current_user.workspace_id
    ).first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found.")

    # Remove stored file if exists
    if doc.storage_key and os.path.exists(doc.storage_key):
        try:
            os.remove(doc.storage_key)
        except Exception:
            pass

    db.delete(doc)
    db.commit()
    return {"message": "Document and associated chunks deleted successfully."}

@router.get("/search/query", response_model=SearchResponse)
def search_documents(
    q: str = Query(..., description="Technical fault code or symptoms to search"),
    site_id: Optional[str] = Query(None),
    model: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return RetrievalService.search_manual(
        db=db,
        workspace_id=current_user.workspace_id,
        query=q,
        site_id=site_id,
        model=model
    )

