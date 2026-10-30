from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict

class ChunkOut(BaseModel):
    id: str
    chunk_index: int
    page_number: Optional[int] = None
    section_heading: Optional[str] = None
    content: str
    token_count: int

    model_config = ConfigDict(from_attributes=True)

class DocumentOut(BaseModel):
    id: str
    workspace_id: str
    site_id: Optional[str] = None
    title: str
    original_filename: str
    mime_type: str
    document_type: str
    status: str
    is_simulated: bool
    uploaded_by: Optional[str] = None
    created_at: datetime
    processed_at: Optional[datetime] = None
    error_summary: Optional[str] = None
    chunk_count: Optional[int] = 0

    model_config = ConfigDict(from_attributes=True)

class DocumentDetailOut(DocumentOut):
    chunks: List[ChunkOut] = []

class SearchResultItem(BaseModel):
    document_id: str
    source_title: str
    page_or_section: str
    excerpt: str
    evidence_level: str = "source_backed"
    is_simulated: bool = False
    score: float = 1.0

class SearchResponse(BaseModel):
    matches: List[SearchResultItem]
    no_reliable_match: bool
    instruction: str
