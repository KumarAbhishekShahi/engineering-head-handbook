"""everline-golden-path: the reference service every Everline team starts from.
Small on purpose: an API, a healthcheck, structured logs, tests, CI checks, IaC stub."""
from fastapi import FastAPI
import logging, json, time

log = logging.getLogger("golden")
app = FastAPI(title="everline-golden-path", version="1.2.0")

_orders = {}

@app.get("/healthz")
def healthz():
    return {"status": "ok", "version": app.version}

@app.post("/orders")
def create_order(order: dict):
    oid = order.get("id")
    if oid in _orders:                       # idempotency: same id -> same answer
        return {"id": oid, "status": _orders[oid], "idempotent_replay": True}
    _orders[oid] = "accepted"
    log.info(json.dumps({"event": "order_accepted", "id": oid, "ts": time.time()}))
    return {"id": oid, "status": "accepted", "idempotent_replay": False}
