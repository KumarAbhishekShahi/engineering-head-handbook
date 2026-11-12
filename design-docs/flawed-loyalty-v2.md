# Design: Everline Loyalty v2  (REVIEW EXERCISE — contains 5 planted flaws)
## Overview
Loyalty v2 awards points on order events and exposes balance/redeem APIs to web, app and the v1 partner API.
## Architecture
- `loyalty-svc` (new) and `promo-svc` will SHARE the existing `promo_db` Postgres for speed of delivery.
- Points awarding: `POST /award` called by checkout; on timeout the client retries up to 3 times.
- Session state (current basket multipliers) kept in process memory; we will scale horizontally under load.
- Balance reads cached in Redis; "Redis will handle projected load."
- v2 replaces v1 endpoints at cutover; v1 is removed the same weekend.
## Rollout
Big-bang cutover during the Tuesday low-traffic window.
