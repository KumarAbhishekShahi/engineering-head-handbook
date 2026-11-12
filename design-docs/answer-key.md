# Answer key — the five flaws (R8)
1. Shared DB between loyalty-svc and promo-svc → hidden coupling; schema changes become cross-team incidents. BLOCKER.
2. In-memory session state + "scale horizontally" → contradiction; needs external store or sticky trade-off stated. BLOCKER.
3. Retries on non-idempotent POST /award → duplicate points on every timeout; needs idempotency key. BLOCKER.
4. v1 removed at cutover, partners still integrated → breach of deprecation policy; needs 12-month window + telemetry. ADVISORY→BLOCKER if partners confirmed.
5. "Redis will handle it" with no arithmetic → capacity claim without math; require the Lab II.1-style estimate. ADVISORY.
Craft notes: ask questions first; write findings as risk → consequence → severity → recommendation; the team should want to return.
