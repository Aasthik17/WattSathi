import re
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_

from app.models.document import Document
from app.models.chunk import DocumentChunk
from app.schemas.document import SearchResultItem, SearchResponse

class RetrievalService:
    @staticmethod
    def search_manual(
        db: Session,
        workspace_id: str,
        query: str,
        site_id: Optional[str] = None,
        model: Optional[str] = None,
        limit: int = 4
    ) -> SearchResponse:
        cleaned_query = query.strip()
        if not cleaned_query:
            return SearchResponse(
                matches=[],
                no_reliable_match=True,
                instruction="Koi query provide nahi ki gayi. Kripya visible error code ya issue batayein."
            )

        # Build base query for chunks in ready documents
        chunk_query = db.query(DocumentChunk, Document).join(
            Document, DocumentChunk.document_id == Document.id
        ).filter(
            DocumentChunk.workspace_id == workspace_id,
            Document.status == "ready"
        )

        if site_id:
            chunk_query = chunk_query.filter(
                or_(DocumentChunk.site_id == None, DocumentChunk.site_id == site_id)
            )

        # Extract tokens, preserving uppercase codes with hyphens like GRID-STATUS-WARN
        raw_tokens = re.findall(r'[A-Za-z0-9_-]+', cleaned_query)
        stop_words = {"the", "is", "at", "which", "on", "and", "a", "an", "in", "to", "for", "of", "with", "par", "hai", "ka", "ke", "ki", "ko", "se", "mein", "kya", "batao", "batata", "likha", "aa", "raha"}
        keywords = [t for t in raw_tokens if t.lower() not in stop_words and len(t) > 1]

        candidates = chunk_query.all()
        scored_results = []

        query_lower = cleaned_query.lower()

        for chunk, doc in candidates:
            content_lower = chunk.content.lower()
            heading_lower = (chunk.section_heading or "").lower()
            title_lower = (doc.title or "").lower()

            score = 0.0

            # Check full query or exact error code match (e.g. GRID-STATUS-WARN)
            for token in raw_tokens:
                if "-" in token or "_" in token or (len(token) > 4 and token.isupper()):
                    if token.lower() in content_lower or token.lower() in heading_lower:
                        score += 50.0  # High bonus for exact error code or model token

            # Model match bonus
            if model and model.lower() in content_lower:
                score += 20.0

            # Keyword matches
            for kw in keywords:
                kw_lower = kw.lower()
                count_content = content_lower.count(kw_lower)
                count_heading = heading_lower.count(kw_lower)
                count_title = title_lower.count(kw_lower)

                score += count_content * 2.0
                score += count_heading * 5.0
                score += count_title * 3.0

            if score > 0:
                scored_results.append((score, chunk, doc))

        scored_results.sort(key=lambda x: x[0], reverse=True)

        if not scored_results:
            return SearchResponse(
                matches=[],
                no_reliable_match=True,
                instruction="Is model ya fault ke liye approved manual guidance nahi mil rahi. Main guess nahi karunga; isse senior engineer ko escalate karte hain."
            )

        matches: List[SearchResultItem] = []
        for score, chunk, doc in scored_results[:limit]:
            page_or_sec = chunk.section_heading or (f"Page {chunk.page_number}" if chunk.page_number else "General")
            matches.append(SearchResultItem(
                document_id=doc.id,
                source_title=doc.title,
                page_or_section=page_or_sec,
                excerpt=chunk.content[:450] + ("..." if len(chunk.content) > 450 else ""),
                evidence_level="source_backed",
                is_simulated=doc.is_simulated,
                score=score
            ))

        return SearchResponse(
            matches=matches,
            no_reliable_match=False,
            instruction="Use only the returned excerpts; do not extrapolate or instruct caller to open live enclosures or touch live wiring."
        )

