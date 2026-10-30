import os
import hashlib
import uuid
import re
from datetime import datetime, timezone
from typing import Optional, List, Tuple
from sqlalchemy.orm import Session
from pypdf import PdfReader

from app.core.config import settings
from app.models.document import Document
from app.models.chunk import DocumentChunk

class DocumentService:
    @staticmethod
    def ensure_storage_dir():
        os.makedirs(settings.UPLOAD_STORAGE_PATH, exist_ok=True)

    @staticmethod
    def calculate_sha256(content: bytes) -> str:
        return hashlib.sha256(content).hexdigest()

    @staticmethod
    def extract_text_from_file(file_path: str, mime_type: str) -> List[Tuple[Optional[int], Optional[str], str]]:
        """
        Returns a list of tuples: (page_number, section_heading, text)
        """
        results = []
        if mime_type == "application/pdf" or file_path.lower().endswith(".pdf"):
            reader = PdfReader(file_path)
            for page_idx, page in enumerate(reader.pages):
                text = page.extract_text() or ""
                if text.strip():
                    results.append((page_idx + 1, f"Page {page_idx + 1}", text))
        else:
            # Markdown or text file
            with open(file_path, "r", encoding="utf-8", errors="replace") as f:
                content = f.read()
            
            # Split by markdown headings if present
            sections = re.split(r'\n(?=#{1,3}\s+)', content)
            for idx, sec in enumerate(sections):
                lines = sec.strip().split("\n")
                heading = lines[0].replace("#", "").strip() if lines else f"Section {idx + 1}"
                body = "\n".join(lines[1:]).strip() if len(lines) > 1 else lines[0]
                results.append((None, heading, sec.strip()))
        return results

    @staticmethod
    def chunk_text(text: str, chunk_size: int = 600, overlap: int = 100) -> List[str]:
        words = text.split()
        if not words:
            return []
        chunks = []
        i = 0
        while i < len(words):
            chunk_words = words[i:i + chunk_size]
            chunks.append(" ".join(chunk_words))
            if i + chunk_size >= len(words):
                break
            i += (chunk_size - overlap)
        return chunks

    @classmethod
    def process_and_save_document(
        cls,
        db: Session,
        workspace_id: str,
        title: str,
        original_filename: str,
        mime_type: str,
        file_bytes: bytes,
        site_id: Optional[str] = None,
        document_type: str = "manufacturer_manual",
        is_simulated: bool = False,
        uploaded_by: Optional[str] = None,
        asset_model_scope: Optional[str] = None
    ) -> Document:
        cls.ensure_storage_dir()
        file_sha256 = cls.calculate_sha256(file_bytes)

        # Unique storage key
        file_ext = os.path.splitext(original_filename)[1]
        storage_filename = f"{uuid.uuid4()}{file_ext}"
        storage_path = os.path.join(settings.UPLOAD_STORAGE_PATH, storage_filename)

        with open(storage_path, "wb") as f:
            f.write(file_bytes)

        doc = Document(
            workspace_id=workspace_id,
            site_id=site_id,
            title=title,
            original_filename=original_filename,
            mime_type=mime_type,
            storage_key=storage_path,
            sha256=file_sha256,
            document_type=document_type,
            status="processing",
            is_simulated=is_simulated,
            uploaded_by=uploaded_by,
            created_at=datetime.now(timezone.utc)
        )
        db.add(doc)
        db.commit()
        db.refresh(doc)

        try:
            extracted_sections = cls.extract_text_from_file(storage_path, mime_type)
            chunk_index = 0
            for page_num, heading, sec_text in extracted_sections:
                chunks = cls.chunk_text(sec_text)
                for chunk_str in chunks:
                    chunk_obj = DocumentChunk(
                        document_id=doc.id,
                        workspace_id=workspace_id,
                        site_id=site_id,
                        asset_model_scope=asset_model_scope,
                        chunk_index=chunk_index,
                        page_number=page_num,
                        section_heading=heading,
                        content=chunk_str,
                        token_count=len(chunk_str.split()),
                        created_at=datetime.now(timezone.utc)
                    )
                    db.add(chunk_obj)
                    chunk_index += 1

            doc.status = "ready"
            doc.processed_at = datetime.now(timezone.utc)
            db.commit()
            db.refresh(doc)
            return doc
        except Exception as e:
            doc.status = "failed"
            doc.error_summary = str(e)
            db.commit()
            db.refresh(doc)
            return doc

