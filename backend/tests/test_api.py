import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.config import settings

client = TestClient(app)

def test_health_endpoint():
    resp = client.get("/api/v1/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "ok"
    assert data["database"] == "connected"

def test_admin_login():
    resp = client.post("/api/v1/auth/login", json={
        "email": settings.ADMIN_EMAIL,
        "password": settings.ADMIN_PASSWORD
    })
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    assert data["user"]["email"] == settings.ADMIN_EMAIL

def test_admin_login_invalid():
    resp = client.post("/api/v1/auth/login", json={
        "email": settings.ADMIN_EMAIL,
        "password": "wrong_password"
    })
    assert resp.status_code == 401
    assert "error" in resp.json()

def test_bolna_tool_auth_required():
    resp = client.post("/api/v1/bolna-tools/get-asset-context", json={})
    assert resp.status_code == 401

def test_bolna_tool_get_asset_context_authorized():
    headers = {"Authorization": f"Bearer {settings.WATTSATHI_BOLNA_TOOL_SECRET}"}
    resp = client.post("/api/v1/bolna-tools/get-asset-context", json={"asset_code": "WS-DEMO-001"}, headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["asset_code"] == "WS-DEMO-001"
    assert data["model"] == "DV-3K-SIM"
    assert data["manufacturer"] == "DemoVolt"

def test_bolna_tool_search_manual():
    headers = {"Authorization": f"Bearer {settings.WATTSATHI_BOLNA_TOOL_SECRET}"}
    resp = client.post("/api/v1/bolna-tools/search-manual", json={
        "query": "GRID-STATUS-WARN error code on display",
        "asset_code": "WS-DEMO-001"
    }, headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["no_reliable_match"] is False
    assert len(data["matches"]) > 0
    top = data["matches"][0]
    assert "GRID-STATUS-WARN" in top["page_or_section"] or "GRID-STATUS-WARN" in top["excerpt"]
    assert top["is_simulated"] is True

def test_bolna_tool_create_work_order_rejected_without_confirmation():
    headers = {"Authorization": f"Bearer {settings.WATTSATHI_BOLNA_TOOL_SECRET}"}
    resp = client.post("/api/v1/bolna-tools/create-work-order", json={
        "asset_code": "WS-DEMO-001",
        "issue_title": "GRID-STATUS-WARN inverter notification",
        "observations": ["Visible warning on display"],
        "caller_confirmed": False  # Must be rejected!
    }, headers=headers)
    assert resp.status_code == 400
    assert "confirmation" in resp.json()["error"]["message"].lower()

def test_bolna_tool_create_work_order_confirmed_success():
    headers = {"Authorization": f"Bearer {settings.WATTSATHI_BOLNA_TOOL_SECRET}"}
    idempotency_key = "test-idempotency-key-001"
    payload = {
        "asset_code": "WS-DEMO-001",
        "issue_title": "GRID-STATUS-WARN inverter notification",
        "observations": ["Visible notification observed from safe distance", "No smoke or heat"],
        "suspected_cause": None,
        "recommended_safe_next_step": "Refer to qualified engineer for review",
        "caller_confirmed": True,
        "idempotency_key": idempotency_key
    }
    resp = client.post("/api/v1/bolna-tools/create-work-order", json=payload, headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "open"
    assert data["caller_confirmed"] is True
    assert data["work_order_number"].startswith("WO-")

    # Idempotency test: duplicate call returns same work order
    resp2 = client.post("/api/v1/bolna-tools/create-work-order", json=payload, headers=headers)
    assert resp2.status_code == 200
    assert resp2.json()["work_order_id"] == data["work_order_id"]

def test_bolna_webhook_ingestion():
    resp = client.post("/api/v1/webhooks/bolna", json={
        "execution_id": "test-exec-uuid-9999",
        "status": "completed",
        "duration": 48,
        "total_cost": 0.048,
        "transcript": "Namaste... GRID-STATUS-WARN display par aa raha hai.",
        "summary": "Technician reported GRID-STATUS-WARN. Manual guidance cited. Work order created.",
        "recording_url": "https://example.com/recording.mp3"
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "success"
    assert data["execution_id"] == "test-exec-uuid-9999"

