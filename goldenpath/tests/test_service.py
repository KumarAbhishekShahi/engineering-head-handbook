from fastapi.testclient import TestClient
from app.service import app

c = TestClient(app)

def test_health():
    r = c.get("/healthz")
    assert r.status_code == 200 and r.json()["status"] == "ok"

def test_order_idempotency():
    a = c.post("/orders", json={"id": "o-1", "amount": 42})
    b = c.post("/orders", json={"id": "o-1", "amount": 42})
    assert a.json()["idempotent_replay"] is False
    assert b.json()["idempotent_replay"] is True

def test_distinct_orders():
    r = c.post("/orders", json={"id": "o-2"})
    assert r.json()["status"] == "accepted"
