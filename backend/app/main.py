import uuid
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.config import settings
from app.core.database import engine, Base, SessionLocal
from app.services.seed_service import SeedService
from app.services.document_service import DocumentService
from app.api.v1.api import api_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("wattsathi")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: initialize database tables and directories
    logger.info("Initializing WattSathi database tables...")
    Base.metadata.create_all(bind=engine)
    DocumentService.ensure_storage_dir()

    # Seed demo data if needed
    db = SessionLocal()
    try:
        seed_result = SeedService.seed_demo_data(db)
        logger.info(f"Seed verified: Workspace={seed_result.get('workspace_id')}, Asset={seed_result.get('asset_code')}")
    except Exception as e:
        logger.error(f"Error seeding demo data: {e}")
    finally:
        db.close()

    yield
    # Shutdown
    logger.info("WattSathi shutting down...")


app = FastAPI(
    title="WattSathi Voice AI Field Engineer",
    description="Voice-first AI troubleshooting and work order automation for rooftop solar O&M technicians.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS if isinstance(settings.BACKEND_CORS_ORIGINS, list) else [settings.BACKEND_CORS_ORIGINS],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Error envelope handling per docs/API_CONTRACT.md
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "code": f"HTTP_{exc.status_code}",
                "message": exc.detail,
                "request_id": str(uuid.uuid4())
            }
        }
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = exc.errors()
    msg = "; ".join([f"{e.get('loc', [])}: {e.get('msg', '')}" for e in errors])
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": {
                "code": "VALIDATION_ERROR",
                "message": msg,
                "request_id": str(uuid.uuid4())
            }
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": "An unexpected error occurred. Please contact system administrator.",
                "request_id": str(uuid.uuid4())
            }
        }
    )

app.include_router(api_router, prefix="/api/v1")

