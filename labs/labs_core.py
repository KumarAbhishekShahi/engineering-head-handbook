"""Everline Group — Engineering Head's Handbook labs. All synthetic, seeded."""
import numpy as np, pandas as pd

# ---------- Part VI: budget ----------
def lab_budget():
    rows = [  # (line, RTB, CTB) in $k — Asha's Platforms & Commerce org
        ("Permanent staff (210 FTE)", 15200, 3800),
        ("Vendor/contract staff (90)", 4300, 2900),
        ("Cloud & infrastructure", 3900, 600),
        ("Software licences & tools", 1750, 250),
        ("Platform programmes", 0, 2100),
        ("Modernization (strangler)", 0, 1900),
        ("Security & compliance", 850, 400),
        ("Training & travel", 380, 120),
    ]
    df = pd.DataFrame(rows, columns=["line", "RTB", "CTB"])
    df["Total"] = df.RTB + df.CTB
    tot = df[["RTB", "CTB", "Total"]].sum()
    print("Everline Platforms & Commerce — FY27 budget build ($k)")
    print(f"{'line':<28}{'RTB':>8}{'CTB':>8}{'Total':>9}")
    for _, r in df.iterrows():
        print(f"{r.line:<28}{r.RTB:>8,}{r.CTB:>8,}{r.Total:>9,}")
    print(f"{'TOTAL':<28}{tot.RTB:>8,}{tot.CTB:>8,}{tot.Total:>9,}")
    print(f"\nRTB share: {tot.RTB/tot.Total:.0%}  (benchmark unease starts ~70%)")
    print("\nThe 15% cut ($4.26M) — three honest options:")
    print(" A pause bottom-quartile CTB programmes  saves $2.4M  delays 2 launches 2 qtrs")
    print(" B vendor ramp-down 30 seats             saves $1.4M  delivery capacity -11%")
    print(" C cloud rightsize + licence rationalise saves $0.9M  one-off effort, low risk")
    print(" recommended: C + A + partial B -> $4.3M, permanent-staff layoffs avoided")

def lab_finops():
    print("Unit economics, Commerce platform (quarter):")
    print("  cost per order processed : $0.142 -> $0.118 (rightsizing + spot)")
    print("  cost per build minute    : $0.031 (fleet) — top 3 repos = 41% of spend")
    print("  idle non-prod (nights)   : $38k/mo -> $9k/mo after scheduler")
    print("rule: every platform publishes ONE unit cost; trends beat totals.")

# ---------- Part IV: DORA ----------
def lab_dora(return_df=False):
    r = np.random.default_rng(27)
    teams = ["Checkout", "Catalog", "Payments", "Logistics", "Identity", "Promotions"]
    rows = []
    for q in range(1, 5):                      # 4 quarters of Asha's tenure
        lift = (q - 1) * 0.45
        for t in teams:
            base = dict(Checkout=3.5, Catalog=2.2, Payments=0.9, Logistics=1.4,
                        Identity=1.1, Promotions=2.8)[t]
            dep_wk = max(0.2, r.normal(base * (1 + lift * 0.6), 0.3))
            lead_d = max(0.5, r.normal(9 / (1 + lift), 1.2))
            cfr = min(0.6, max(0.02, r.normal(0.21 / (1 + lift * 0.8), 0.03)))
            mttr_h = max(0.4, r.normal(14 / (1 + lift), 2.0))
            rows.append((f"Q{q}", t, dep_wk, lead_d, cfr, mttr_h))
    df = pd.DataFrame(rows, columns=["q", "team", "deploys_wk", "lead_days", "cfr", "mttr_h"])
    if return_df: return df
    agg = df.groupby("q").agg(deploys_wk=("deploys_wk", "mean"), lead_days=("lead_days", "mean"),
                              cfr=("cfr", "mean"), mttr_h=("mttr_h", "mean")).round(2)
    print("Everline P&C — DORA four keys, org average by quarter (Asha's year one)")
    print(f"{'':>3}{'deploys/wk':>11}{'lead days':>10}{'CFR':>7}{'MTTR h':>8}")
    for q, r_ in agg.iterrows():
        print(f"{q:>3}{r_.deploys_wk:>11}{r_.lead_days:>10}{r_.cfr:>7.0%}{r_.mttr_h:>8}")
    worst = df[df.q == "Q4"].sort_values("cfr").iloc[-1]
    print(f"\nQ4 outlier: {worst.team} CFR {worst.cfr:.0%} — metrics locate conversations, never verdicts.")
    print("anti-gaming rule: four keys move together or not at all; never target one alone.")

def lab_devex():
    print("DevEx survey, 287 responses (74%) — top friction, 1-5 pain score:")
    print("  flaky end-to-end tests        3.9   'reruns are a tax on every merge'")
    print("  local env setup               3.6   median 3.5 days to first commit")
    print("  unclear service ownership     3.3   '11 Slack hops to find an owner'")
    print("  PR review wait                3.1   p50 7h, p90 29h")
    print("  build times                   2.7   p50 11 min")
    print("actions (owner, quarter): quarantine+fix flaky suite (QE lead, Q2);")
    print("  golden-path dev container (Platform, Q2); service catalog with owners (Staff eng, Q3)")
    print("re-survey quarterly; publish deltas beside DORA board.")

# ---------- Part II: capacity ----------
def lab_capacity():
    print("Everline payments platform — Black Friday capacity math")
    orders_day = 26_000_000; peak_mult = 8
    tps_avg = orders_day / 86400
    tps_peak = tps_avg * peak_mult
    print(f"  orders/day {orders_day:,} -> avg {tps_avg:,.0f} TPS, peak x{peak_mult} = {tps_peak:,.0f} TPS")
    writes = tps_peak * 3           # order + payment + ledger
    print(f"  DB writes at peak: x3 per order = {writes:,.0f}/s -> partition by order_id, ~{int(np.ceil(writes/2000))} shards @2k w/s")
    pods = int(np.ceil(tps_peak / (150 * 0.6)))
    print(f"  service pods: ceil({tps_peak:,.0f} / (150/pod x 60%)) = {pods} + n+2, per region")
    print(f"  queue depth if payments degrade 10 min: {tps_peak*600:,.0f} msgs -> broker sized 10x that")
    print("  idempotency: client order-UUID; ledger append-only; exactly-once = at-least-once + dedupe")

# ---------- Part VIII: incident ----------
def lab_incident():
    events = [
        ("00:00", "Checkout error rate 0.4% -> 6.1%; pager fires (SLO fast-burn)"),
        ("00:04", "IC declared: Asha's on-call lead. Comms channel + status page draft"),
        ("00:09", "Dashboard: p99 DB latency 40ms -> 2.1s on orders primary"),
        ("00:14", "Change log: connection-pool config shipped 23:41 (-37% max conns)"),
        ("00:16", "Decision: rollback config. Risk: pool thrash ~2 min. Approved by IC"),
        ("00:21", "Rollback complete; error rate 1.8% and falling"),
        ("00:26", "Error rate 0.5%; monitoring 15 min before all-clear"),
        ("00:41", "Incident closed S2. Customer impact: 41 min, ~18k failed checkouts"),
    ]
    print("Black Friday eve, 00:00-00:41 — incident command timeline (sim)")
    for t, e in events: print(f"  T+{t}  {e}")
    print("postmortem actions: config change gates on load-test (owner: Platform, 2 wks);")
    print("  pool alarms on saturation not just latency (SRE, 1 wk); checkout queue-and-retry (Checkout, Q2)")
    print("IC rule that saved 20 minutes: one decider, explicit decision log, comms every 10 min.")

# ---------- Part III: attrition ----------
def lab_attrition():
    print("Attrition diagnosis — Everline P&C, trailing 12m: 19% overall (market 12%)")
    print("  by cohort: senior engineers 27% | 2 squads = 61% of exits | tenure 1-2y worst")
    print("  exit themes (coded from 23 interviews): growth path 14, legacy-only work 11,")
    print("    manager churn 8, comp 6  <- comp is 4th, not 1st")
    print("  actions: staff-eng track launched; modernization rotation for legacy squads;")
    print("    manager stability pledge; targeted comp fixes only where flagged")
    print("  result after 2 qtrs: regrettable attrition 27% -> 14% senior cohort")

# ---------- Part II: golden path ----------
def lab_goldenpath():
    import subprocess, os
    d = os.path.join(os.path.dirname(__file__), "..", "goldenpath")
    r = subprocess.run(["python", "-m", "pytest", "-q", "tests"], cwd=d, capture_output=True, text=True)
    print("everline-golden-path service — checks run at build time:")
    print(r.stdout.strip().splitlines()[-1])
    r2 = subprocess.run(["python", "ci_checks.py"], cwd=d, capture_output=True, text=True)
    print(r2.stdout.rstrip())

if __name__ == "__main__":
    for fn in [lab_budget, lab_finops, lab_dora, lab_devex, lab_capacity, lab_incident, lab_attrition, lab_goldenpath]:
        print(f"== {fn.__name__} =="); fn(); print()
