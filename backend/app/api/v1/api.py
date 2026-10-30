from fastapi import APIRouter

from app.api.v1.endpoints import (
    health,
    auth,
    sites,
    assets,
    documents,
    work_orders,
    calls,
    bolna_tools,
    webhooks,
    analytics,
)

api_router = APIRouter()

api_router.include_router(health.router, tags=["Health"])
api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])
api_router.include_router(sites.router, prefix="/sites", tags=["Sites"])
api_router.include_router(assets.router, prefix="/assets", tags=["Assets"])
api_router.include_router(documents.router, prefix="/documents", tags=["Documents"])
api_router.include_router(work_orders.router, prefix="/work-orders", tags=["Work Orders"])
api_router.include_router(calls.router, prefix="/calls", tags=["Calls"])
api_router.include_router(bolna_tools.router, prefix="/bolna-tools", tags=["Bolna Tools"])
api_router.include_router(webhooks.router, prefix="/webhooks", tags=["Webhooks"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])

