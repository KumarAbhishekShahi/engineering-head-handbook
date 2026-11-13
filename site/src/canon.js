/* Everline canon — every number from "The Engineering Head's Handbook" lives here, once. */
"use strict";
const CANON = {
  todaySeed: "2026-11-02", blackFriday: "2026-11-27",
  org: { engineers: 300, perm: 210, vendor: 90, directors: 6, apps: 120, sites: ["Pune", "Rotterdam", "Austin"] },
  budget: { total: 28.4e6, rtbPct: 69, cutPct: 15, cutTarget: 4.26e6, A: 2.4e6, B: 1.4e6, C: 0.9e6, unitCostFrom: 0.142, unitCostTo: 0.118 },
  capacity: { ordersPerDay: 26e6, peakX: 8, peakTps: 2407, dbWrites: 7222, shards: 4, pods: 27, firstCeilingX: 2.2 },
  incident: { minutes: 41, sev: "S2", failedCheckouts: 18000, cause: "connection-pool configuration change" },
  attrition: { overall: 19, market: 12, seniorH1: 27, seniorNow: 14, themes: ["growth path", "legacy-only work", "manager churn", "comp"] },
  devex: { topFriction: "flaky tests", topScore: 3.9, firstCommitDays: 3.5, prP50h: 7, prP90h: 29 },
  slo: { target: "99.9%", monthlyBudgetMin: 43 },
  dora: { q: ["Q1", "Q2", "Q3", "Q4"], deploys: [1.96, 2.56, 3.2, 3.41], lead: [8.85, 6.29, 5.28, 3.2], cfr: [22, 15, 10, 12], mttr: [12.04, 10.1, 7.15, 6.7], outlier: "Promotions CFR 15% in Q4" },
  audit: { findings: 11, critical: 3, drFirst: "4h12m", drLatest: "38 minutes", rto: "1 hour" },
  wms: { rise: 40, exitCost: 3.1e6, exitMonths: 14, settled: 8 },
  principles: ["Build what differentiates, buy the rest, never build what you can't operate", "Decisions, not documents", "Trade a fake date for real ones", "Amber is rewarded", "The priced yes", "RTO proven, not promised", "Exceptions expire", "Bad news travels on slide 1", "Answers = mechanism + number + named cost"]
};
