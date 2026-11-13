/* Everline modules: OnCallOps, SLOBoard, TrustDesk, CopilotDesk, BoardRoom, DealRoom, CrisisDesk */
"use strict";

/* ================= OnCallOps ================= */
SITE.modules.push({
  id: "oncall", icon: "alert", label: "OnCallOps", home: "oncall", color: "#c2334d", desc: "Incidents, on-call health, postmortems",
  navCount: () => Store.all("incidents").filter(i => !String(i.status).startsWith("Closed")).length || null,
  routes: {
    "oncall": (main) => {
      main.append(C.crumbs({ label: "OnCallOps" }), C.pageHead("OnCallOps — incidents & on-call", "Incident command with a decision log and comms cadence; on-call health measured in depth and pages per week; postmortem actions tracked to done."));
      const inc = Store.all("incidents");
      const acts = inc.flatMap(i => i.actions || []);
      main.append(U.h("div", { class: "grid4" }, C.stat("Incidents (12 mo)", inc.length), C.stat("S1 / S2", inc.filter(i => i.sev === "S1").length + " / " + inc.filter(i => i.sev === "S2").length), C.stat("Postmortem action completion", U.pct(100 * acts.filter(a => a[1] === "Done").length / acts.length, 0), "bar: 85%", "warn"), C.stat("Repeat-incident rate", U.pct(100 * inc.filter(i => i.repeat).length / inc.length, 0), "same cause within 90 days")));
      main.append(C.tabs("oc", [
        { id: "inc", label: "Incidents", render: () => C.table({ id: "inc", rows: inc, pageSize: 15, defaultSort: "date", views: [{ label: "All" }, { label: "Open actions", filter: r => !String(r.status).startsWith("Closed") }, { label: "S1–S2", filter: r => ["S1", "S2"].includes(r.sev) }], columns: [{ key: "id", label: "ID", render: r => U.h("span", { class: "mono" }, r.id) }, { key: "sev", label: "Sev", filter: "select", render: r => C.pill(r.sev) }, { key: "title", label: "Incident", render: r => U.h("span", null, r.title, r.canon ? C.pill("book: incident sim", "purple") : null) }, { key: "date", label: "Date", render: r => U.date(r.date) }, { key: "durationMin", label: "Duration", render: r => r.durationMin + " min" }, { key: "impact", label: "Impact" }, { key: "status", label: "Status", filter: "select", render: r => C.pill(r.status) }], onRow: r => Router.go("oncall/inc/" + r.id) }) },
        {
          id: "rota", label: "On-call health", render: () => U.h("div", null,
            U.h("div", { class: "card", style: { marginBottom: "1rem" } }, U.h("h3", null, "Pages per week by rota (target < 6)"), Charts.hbars({ items: SEED.rotations.map(r => ({ label: r.squad + " (depth " + r.primaryDepth + ")", value: r.pagesPerWeek, color: r.pagesPerWeek > 10 ? "#c2334d" : r.pagesPerWeek > 6 ? "#d97706" : "#1f8a5b" })), fmt: v => v + "/wk", padL: 170 })),
            C.table({ id: "rota", rows: SEED.rotations.map(r => ({ ...r, id: r.squad })), columns: [{ key: "squad", label: "Rota" }, { key: "primaryDepth", label: "Depth" }, { key: "pagesPerWeek", label: "Pages/week" }, { key: "afterHoursPct", label: "After-hours", render: r => r.afterHoursPct + "%" }, { key: "status", label: "Health", render: r => C.pill(r.status) }] }),
            C.banner("warn", "Identity: 17 pages/week, 62% after-hours, depth 4 — two engineers asked to leave the rota. On-call health is a retention problem wearing an operations hat."))
        },
        {
          id: "pm", label: "Postmortem actions", render: () => C.table({ id: "pma", rows: inc.flatMap(i => (i.actions || []).map((a, k) => ({ id: i.id + "-" + k, inc: i.id, text: a[0], status: a[1] }))), pageSize: 20, views: [{ label: "Open", filter: r => r.status !== "Done" }, { label: "All" }], columns: [{ key: "inc", label: "Incident" }, { key: "text", label: "Action" }, { key: "status", label: "Status", filter: "select", render: r => C.pill(r.status) }] })
        }
      ]));
    },
    "oncall/inc": (main, args) => {
      const i = Store.get("incidents", args[0]); if (!i) return main.append(C.banner("bad", "Incident not found."));
      main.append(C.crumbs({ label: "OnCallOps", href: "#/oncall" }, { label: i.id }), C.pageHead(i.title, i.id + " · " + U.date(i.date) + " · IC " + EV.name(i.icId), C.pill(i.sev), C.pill(i.status)));
      if (i.canon) main.append(C.banner("info", U.h("b", null, "The book's incident simulation. "), `${CANON.incident.minutes} minutes, ${CANON.incident.sev}, ~${U.num(CANON.incident.failedCheckouts, 0)} failed checkouts; cause: a ${CANON.incident.cause}. This year's freeze rules exist because of it.`));
      main.append(U.h("div", { class: "grid2" },
        U.h("div", { class: "card" }, U.h("h3", null, "Decision log"), (i.decisionLog || []).length ? U.h("ul", { class: "audit" }, i.decisionLog.map(t => U.h("li", null, U.h("span", { class: "when" }, t[0]), U.h("span", null, t[1])))) : U.h("p", { class: "muted" }, "Summary-only record.")),
        U.h("div", { class: "card" }, U.h("h3", null, "Analysis"), C.kv([["Duration", i.durationMin + " minutes"], ["Impact", i.impact], ["Cause", i.cause], ["Repeat?", i.repeat ? "Yes — same cause within 90 days" : "No"]]),
          U.h("h3", { style: { marginTop: "1rem" } }, "Postmortem actions"), U.h("ul", { style: { listStyle: "none" } }, (i.actions || []).map(a => U.h("li", { style: { padding: ".2rem 0" } }, C.pill(a[1]), " ", a[0]))))));
    }
  }
});

/* ================= SLOBoard ================= */
SITE.modules.push({
  id: "slo", icon: "target", label: "SLOBoard", home: "slo", color: "#2a8c8c", desc: "Journey SLOs & error budgets",
  routes: {
    "slo": (main) => {
      main.append(C.crumbs({ label: "SLOBoard" }), C.pageHead("SLOBoard — reliability", `Journey SLOs with error budgets. ${CANON.slo.target} = a ${CANON.slo.monthlyBudgetMin}-minute monthly budget. Three-state policy: Normal → Caution → Frozen (reliability work only).`));
      const slos = Store.all("slos");
      main.append(U.h("div", { class: "grid4" }, slos.slice(0, 4).map(s => U.h("div", { class: "card center" }, U.h("div", { class: "small", style: { fontWeight: 600 } }, s.journey), Charts.gauge(s.burnPct / 100, { label: s.burnPct + "%", sub: "of " + s.budgetMin + "-min budget", warn: .75, bad: 1 }), C.pill(s.state)))));
      main.append(U.h("div", { class: "grid2", style: { marginTop: "1rem" } },
        U.h("div", { class: "card" }, U.h("h3", null, "Checkout budget burn — this month (%)"), Charts.line({ labels: SEED.sloBurn.map((_, i) => String(i + 1)), series: [{ label: "Login (frozen)", points: SEED.sloBurn, color: "#c2334d" }], goal: 100, fmt: v => v + "%" }), U.h("p", { class: "muted small" }, "Crossing 100% moves the journey to Frozen: feature work stops for that service until burn recovers. The policy gives the head the authority — and the cover — to say no.")),
        U.h("div", { class: "card" }, U.h("h3", null, "Three-state budget policy"), U.h("table", { class: "data" }, U.h("tbody", null, [["Normal (< 75% burn)", "Ship freely; normal change policy"], ["Caution (75–100%)", "Risky changes need SRE sign-off; postmortems for every page"], ["Frozen (> 100%)", "Reliability work only until burn recovers; director signs the release"]].map(r => U.h("tr", null, U.h("td", null, C.pill(r[0])), U.h("td", null, r[1]))))))));
      main.append(U.h("div", { style: { marginTop: "1rem" } }, C.table({ id: "slos", rows: slos, columns: [{ key: "journey", label: "Journey" }, { key: "target", label: "Target" }, { key: "budgetMin", label: "Monthly budget", render: r => r.budgetMin + " min" }, { key: "burnPct", label: "Burned", render: r => U.h("span", { class: r.burnPct > 100 ? "down" : "" }, r.burnPct + "%") }, { key: "state", label: "State", render: r => C.pill(r.state) }, { key: "signoff", label: "Signed off by" }] })));
    }
  }
});

/* ================= TrustDesk ================= */
SITE.modules.push({
  id: "trustdesk", icon: "shield", label: "TrustDesk", home: "trustdesk", color: "#3b1450", desc: "Controls, audit, exceptions, DR",
  navCount: () => Store.all("exceptions").filter(e => e.expiry < Clock.today()).length || null,
  routes: {
    "trustdesk": (main) => {
      main.append(C.crumbs({ label: "TrustDesk" }), C.pageHead("TrustDesk — GRC & security", "Every control answers 'show me' with a pipeline log, not a meeting minute. Exceptions expire. RTO is proven, not promised."));
      const f = Store.all("findings");
      main.append(U.h("div", { class: "grid4" }, C.stat("Inherited findings", f.length, CANON.audit.critical + " critical"), C.stat("Closed", f.filter(x => x.status === "Closed").length, "all 3 criticals closed", "ok"), C.stat("Exceptions expired", Store.all("exceptions").filter(e => e.expiry < Clock.today()).length, "exceptions expire", "bad"), C.stat("DR RTO (latest)", CANON.audit.drLatest, "first drill " + CANON.audit.drFirst, "ok")));
      main.append(C.tabs("td", [
        { id: "find", label: "Audit findings", render: () => C.table({ id: "find", rows: f, columns: [{ key: "id", label: "ID" }, { key: "sev", label: "Severity", filter: "select", render: r => C.pill(r.sev) }, { key: "text", label: "Finding" }, { key: "status", label: "Status", filter: "select", render: r => C.pill(r.status) }, { key: "due", label: "Due", render: r => U.h("span", { class: "sla " + (r.status === "Closed" ? "ok" : U.dueClass(r.due, 30)) }, U.date(r.due)) }, { key: "evidence", label: "Closure evidence" }] }) },
        {
          id: "exc", label: "Exceptions register", render: () => C.table({
            id: "exc", rows: Store.all("exceptions"), columns: [{ key: "id", label: "ID" }, { key: "control", label: "Control excepted" }, { key: "compensating", label: "Compensating control" }, { key: "acceptorId", label: "Risk acceptor", render: r => EV.name(r.acceptorId) }, { key: "expiry", label: "Expiry", render: r => U.h("span", { class: "sla " + U.dueClass(r.expiry, 14) }, U.date(r.expiry) + " (" + U.rel(r.expiry) + ")") },
            { key: "a", label: "", render: r => r.expiry < Clock.today() ? U.h("div", { class: "flex" }, U.h("button", { class: "btn sm ok", onclick: () => { Store.save("exceptions", r.id, { expiry: U.addDays(Clock.today(), 7), status: "Renewed 7 days — fix dated" }, "Short renewal with dated fix", "7-day max"); Router.refresh(); } }, "Renew 7d + fix"), U.h("button", { class: "btn sm sec", onclick: () => { Store.save("exceptions", r.id, { expiry: "2099-01-01", status: "Closed — control implemented" }, "Closed: control implemented", ""); Router.refresh(); } }, "Mark fixed")) : C.pill("active", "green") }]
          })
        },
        { id: "ctl", label: "Control matrix", render: () => C.table({ id: "ctl", rows: SEED.controls, columns: [{ key: "id", label: "ID" }, { key: "control", label: "Control" }, { key: "domain", label: "Domain", filter: "select" }, { key: "evidence", label: "Evidence ('show me')" }, { key: "status", label: "Status", render: r => C.pill(r.status, r.status === "Effective" ? "green" : "amber") }] }) },
        { id: "vuln", label: "Vulnerabilities", render: () => U.h("div", { class: "grid2" }, U.h("div", { class: "card" }, U.h("h3", null, "Open by severity vs SLA"), Charts.bars({ labels: SEED.vulns.map(v => v.sev), series: [{ label: "Open", points: SEED.vulns.map(v => v.open) }, { label: "Breaching SLA", points: SEED.vulns.map(v => v.breachingSla), color: "#c2334d" }] })), U.h("div", { class: "card" }, U.h("h3", null, "SLA by severity"), C.kv(SEED.vulns.map(v => [v.sev, v.slaDays + " days"])))) },
        { id: "access", label: "Access & leavers", render: () => U.h("div", { class: "grid2" }, U.h("div", { class: "card" }, U.h("h3", null, "Recertification campaigns"), U.h("table", { class: "data" }, U.h("tbody", null, SEED.recerts.map(r => U.h("tr", null, U.h("td", null, r.id), U.h("td", null, r.scope), U.h("td", null, r.accounts + " accts"), U.h("td", null, r.revoked != null ? r.revoked + " revoked" : "—"), U.h("td", null, C.pill(r.status))))))), U.h("div", { class: "card" }, U.h("h3", null, "Leaver access removal p95 (hours, target 24)"), Charts.line({ labels: SEED.months.map(m => m.slice(2)), series: [{ label: "p95 h", points: SEED.leaverP95 }], goal: 24, fmt: v => v + "h" }))) },
        { id: "dr", label: "DR drills", render: () => U.h("div", null, U.h("div", { class: "card", style: { marginBottom: "1rem" } }, U.h("h3", null, "Measured RTO by drill (target " + CANON.audit.rto + ")"), Charts.bars({ labels: SEED.drDrills.filter(x => x.result).map(x => U.dateShort(x.date)), series: [{ label: "Minutes", points: [252, 81, 38] }], fmt: v => v + " min" })), C.table({ id: "dr", rows: SEED.drDrills.map(x => ({ ...x, id: x.date })), columns: [{ key: "date", label: "Date", render: r => U.date(r.date) }, { key: "scope", label: "Scope" }, { key: "rtoTarget", label: "Target" }, { key: "result", label: "Measured RTO", render: r => r.result || C.pill("scheduled", "purple") }, { key: "notes", label: "Notes" }] })) },
        { id: "tpr", label: "Third-party risk", render: () => C.table({ id: "tpr", rows: Store.all("vendors"), columns: [{ key: "name", label: "Vendor" }, { key: "tier", label: "Blast-radius tier", filter: "select", render: r => C.pill(r.tier) }, { key: "c1", label: "Breach notice ≤72h", render: r => r.clauses["Breach notification (72h)"] ? "✓" : U.h("b", { class: "down" }, "✗ missing") }, { key: "c2", label: "Exit clause", render: r => r.clauses["Exit & transition"] ? "✓" : U.h("b", { class: "down" }, "✗") }, { key: "c3", label: "Audit rights", render: r => r.clauses["Audit rights"] ? "✓" : U.h("b", { class: "down" }, "✗") }] }) }
      ]));
    }
  }
});

/* ================= CopilotDesk ================= */
SITE.modules.push({
  id: "copilotdesk", icon: "flask", label: "CopilotDesk", home: "copilotdesk", color: "#f07d1a", desc: "AI adoption, tools, boundaries",
  routes: {
    "copilotdesk": (main) => {
      main.append(C.crumbs({ label: "CopilotDesk" }), C.pageHead("CopilotDesk — AI adoption", "Approved tools, adoption by tier, data boundaries enforced in tooling, and quality measured by provenance."));
      main.append(U.h("div", { class: "grid2" },
        U.h("div", { class: "card" }, U.h("h3", null, "Approved-tool register & boundaries"), U.h("table", { class: "data" }, U.h("thead", null, U.h("tr", null, ["Tool", "Status", "Data boundary"].map(h => U.h("th", null, h)))), U.h("tbody", null, SEED.aiTools.map(t => U.h("tr", null, U.h("td", null, t.tool), U.h("td", null, C.pill(t.tier, t.tier === "Blocked" ? "red" : t.tier === "Pilot" ? "amber" : "green")), U.h("td", { class: "small" }, t.boundary)))))),
        U.h("div", { class: "card" }, U.h("h3", null, "Adoption (% of engineers, last 30 days)"), Charts.hbars({ items: SEED.aiTools.filter(t => t.adoption).map(t => ({ label: t.tool, value: t.adoption })), max: 100, fmt: v => v + "%", padL: 200 }))));
      main.append(U.h("div", { class: "card", style: { marginTop: "1rem" } }, U.h("h3", null, "Quality by provenance tier"), U.h("table", { class: "data" }, U.h("thead", null, U.h("tr", null, ["Tier", "Share", "CFR", "Review time"].map(h => U.h("th", null, h)))), U.h("tbody", null, SEED.aiMetrics.map(a => U.h("tr", null, U.h("td", null, a.tier), U.h("td", null, a.share + "%"), U.h("td", null, a.cfr + "%"), U.h("td", null, a.reviewTimeH + "h"))))),
        U.h("p", { class: "muted small", style: { marginTop: ".5rem" } }, "Policy in one line: approved tools only, source code is the boundary, AI-generated code is reviewed like any other, and we measure outcomes by provenance — never lines generated.")));
    }
  }
});

/* ================= BoardRoom ================= */
SITE.modules.push({
  id: "boardroom", icon: "doc", label: "BoardRoom", home: "boardroom", color: "#3b1450", desc: "Ops review, QBRs, board pack",
  routes: {
    "boardroom": (main) => {
      main.append(C.crumbs({ label: "BoardRoom" }), C.pageHead("BoardRoom — exec & board reporting", "Every pack generates from live data and prints cleanly. Bad news travels on slide 1; decisions needed on slide 8."));
      main.append(U.h("div", { class: "grid3" }, [["pack", "Quarterly board pack (8 slides)", "Board / CEO"], ["ops", "Monthly ops review", "Viktor (CIO)"], ["ai", "'Where are we on AI' brief", "ExCo"], ["qbr", "Business-partner QBR (CMO/COO)", "CMO, COO"], ["strategy", "One-page technology strategy", "Viktor / ExCo"], ["exco", "ExCo one-pager: Black Friday readiness", "ExCo"]].map(([id, t, a]) =>
        U.h("a", { class: "card", href: "#/boardroom/view/" + id, style: { display: "block", color: "inherit", textDecoration: "none" } }, U.h("h3", null, t), C.pill(a, "purple")))));
    },
    "boardroom/view": (main, args) => {
      const id = args[0];
      const S = (title, ...kids) => U.h("div", { class: "slide" }, U.h("h2", null, title), kids, U.h("div", { class: "foot" }, "Everline Group · Platforms & Commerce · " + U.date(Clock.today()) + " · Training simulation — all data fictional"));
      main.append(C.crumbs({ label: "BoardRoom", href: "#/boardroom" }, { label: id }), C.pageHead({ pack: "Quarterly board pack", ops: "Monthly ops review", ai: "Where are we on AI", qbr: "Business-partner QBR", strategy: "Technology strategy (one page)", exco: "Black Friday readiness" }[id] || id, "Generated " + U.date(Clock.today()), U.h("button", { class: "btn sec noprint", onclick: () => window.print() }, "⎙ Print / PDF")));
      const D = CANON.dora, b = SEED.budget;
      if (id === "pack") {
        main.append(
          S("1 · The bad news first", U.h("ul", { style: { paddingLeft: "1.2rem", lineHeight: 1.9, fontSize: "1rem" } },
            U.h("li", null, "Atlas: the Catalog cutover slipped a quarter (CDC lag under peak test). Re-dated at P85 to 26 Feb; reversibility rule kept."),
            U.h("li", null, "Fulfilment 2.0 was red for twelve months. Reset with the five moves; first warehouse live; carrier-API dependency still the structural risk."),
            U.h("li", null, "Senior engineer attrition hit 27% in H1 (market 12% overall). Now 14% after growth-path and legacy-rotation actions."))),
          S("2 · Delivery as a management system", Charts.line({ labels: D.q, series: [{ label: "Lead time (d)", points: D.lead }, { label: "MTTR (h)", points: D.mttr }, { label: "CFR %", points: D.cfr }] }), U.h("p", null, "Deploys/week " + D.deploys[0] + " → " + D.deploys[3] + ". Four keys read together; Promotions CFR 15% is a conversation, not a verdict.")),
          S("3 · Reliability & Black Friday", C.kv([["Last year", CANON.incident.minutes + "-minute S2, ~" + U.num(CANON.incident.failedCheckouts, 0) + " failed checkouts (pool config change)"], ["This year", "Freeze from 20 Nov; pool config now risky-class; load test at 3× on 13 Nov"], ["Capacity", U.num(CANON.capacity.peakTps, 0) + " TPS peak, " + U.num(CANON.capacity.dbWrites, 0) + " DB writes/s, " + CANON.capacity.shards + " shards → 6 after split, " + CANON.capacity.pods + " pods"], ["Checkout SLO", CANON.slo.target + " (" + CANON.slo.monthlyBudgetMin + "-min monthly budget)"]])),
          S("4 · Money", C.kv([["Budget", U.money(b.total) + " · RTB " + b.rtbPct + "%"], ["15% cut", "Options A $2.4M / B $1.4M / C $0.9M; recommended C + A + partial B = $4.3M; no permanent layoffs"], ["Unit cost per order", "$" + CANON.budget.unitCostFrom + " → $" + CANON.budget.unitCostTo]])),
          S("5 · People", C.kv([["Headcount", "300 engineers (210 permanent, 90 vendor) across Pune, Rotterdam, Austin"], ["Attrition", "19% overall vs 12% market; exit themes: growth path > legacy-only work > manager churn > comp"], ["Succession", "Director resignation (Fulfilment) covered by the succession line from the talent review"]])),
          S("6 · Risk & controls", C.kv([["Audit", "11 inherited findings, all 3 criticals closed with evidence"], ["DR", "RTO proven, not promised: " + CANON.audit.drFirst + " → " + CANON.audit.drLatest + " against a 1-hour target"], ["Exceptions", "Every exception expires; one expired this month and was closed by fixing the control"], ["Vendors", "Kestrel +40% met with a priced exit ($3.1M / 14 months)"]])),
          S("7 · AI in engineering", U.h("p", null, "Approved tools with data boundaries enforced at the gateway; 73% of merged PRs AI-assisted or AI-generated with CFR no worse than human-authored. We measure outcomes by provenance, never lines generated.")),
          S("8 · Decisions needed today", U.h("ol", { style: { paddingLeft: "1.4rem", lineHeight: 2, fontSize: "1.02rem" } },
            U.h("li", null, U.h("b", null, "Protect modernisation from the cut: "), "keep Atlas CTB ($1.4M) out of option A — 69% RTB is the case for it."),
            U.h("li", null, U.h("b", null, "Parcelwise: "), "approve proceeding at ≤ $165M with retention package and 90-day security remediation as condition precedent."),
            U.h("li", null, U.h("b", null, "Kestrel: "), "authorise the integration-layer exit start in Q1 if the renewal exceeds 10%."))));
        return;
      }
      if (id === "ops") {
        main.append(S("Monthly ops review — Platforms & Commerce", U.h("div", { class: "grid4" }, C.stat("Commitments kept", "82%"), C.stat("Lead time", D.lead[3] + "d"), C.stat("Checkout burn", Store.all("slos")[0].burnPct + "%"), C.stat("Budget var.", U.money(U.sum(b.actuals, "actual") - U.sum(b.actuals, "plan")))),
          U.h("h3", { style: { marginTop: "1rem" } }, "Top risks"), U.h("ol", { style: { paddingLeft: "1.2rem" } }, Store.all("programs").filter(p => p.rag !== "Green").map(p => U.h("li", null, U.h("b", null, p.name + ": "), p.topRisk))),
          U.h("h3", null, "Asks of Viktor"), U.h("ul", { style: { paddingLeft: "1.2rem" } }, U.h("li", null, "Escalate carrier API v2 with Logistics Core (Nadia) — named owner & P85"), U.h("li", null, "Back the Kestrel exit position in Thursday's meeting"))));
        return;
      }
      if (id === "ai") { main.append(S("Where are we on AI (engineering)", C.kv([["Adoption", "Code assistant 78% of engineers; internal chat 64%; agents in pilot"], ["Boundaries", "Source code only; no customer data; enforced at gateway"], ["Quality", "AI-generated tier CFR 11% vs human 12%; review time 5.2h vs 7.4h"], ["Next bets", "Test-generation agent for flaky-test programme; PR review agent advisory-only"], ["Not doing", "Autonomous merges; customer-data prompts; per-engineer AI productivity scoring"]]))); return; }
      if (id === "qbr") { main.append(S("Business-partner QBR (CMO & COO)", U.h("table", { class: "data" }, U.h("thead", null, U.h("tr", null, ["Commitment", "P85", "Status / trade"].map(h => U.h("th", null, h)))), U.h("tbody", null, Store.all("commitments").map(c => U.h("tr", null, U.h("td", null, c.what), U.h("td", null, U.date(c.p85)), U.h("td", { class: "small" }, c.changeLog.length ? c.changeLog[c.changeLog.length - 1][1] : "On track"))))))); return; }
      if (id === "strategy") { main.append(S("Technology strategy — one page", U.h("div", { class: "grid2" }, U.h("div", null, U.h("h3", null, "Context"), U.h("p", { class: "small" }, "International expansion → multi-region; margin pressure → unit costs down."), U.h("h3", null, "Three bets"), U.h("ol", { class: "small", style: { paddingLeft: "1.2rem" } }, U.h("li", null, "Platform consolidation (120 apps → paved road)"), U.h("li", null, "Modernise the two revenue-critical monoliths (Atlas)"), U.h("li", null, "Delivery metrics as the management system"))), U.h("div", null, U.h("h3", null, "Non-goals"), U.h("ul", { class: "small", style: { paddingLeft: "1.2rem" } }, U.h("li", null, "No data-centre exit this cycle"), U.h("li", null, "No rewrite of the logistics core"), U.h("li", null, "No new languages")), U.h("h3", null, "Scoreboard (quarterly)"), U.h("ul", { class: "small", style: { paddingLeft: "1.2rem" } }, ["Lead time", "CFR", "Unit cost per order", "Modernisation %", "Regrettable attrition"].map(x => U.h("li", null, x))))))); return; }
      main.append(S("Black Friday readiness — ExCo one-pager", C.kv([["Date", U.date(CANON.blackFriday) + " (" + U.rel(CANON.blackFriday) + ")"], ["Capacity", "Peak " + U.num(CANON.capacity.peakTps, 0) + " TPS baseline; 3× forecast requires shard split 4 → 6 (in progress)"], ["Go/no-go", "Load test 13 Nov at 3× — " + (Store.state("loadTestPassed") ? "PASSED" : "pending")], ["Freeze", "20 Nov – 1 Dec"], ["War room", "Staffed from eve; IC rota named; comms cadence 15 min"]])));
    }
  }
});

/* ================= DealRoom ================= */
SITE.modules.push({
  id: "dealroom", icon: "scale", label: "DealRoom", home: "dealroom", color: "#4a6fd1", desc: "M&A technical due diligence",
  routes: {
    "dealroom": (main) => {
      const t = SEED.ddTarget;
      main.append(C.crumbs({ label: "DealRoom" }), C.pageHead("DealRoom — " + t.name, t.ask + " · indicative valuation " + t.valuation + ". Ten working days to a priced verdict."));
      main.append(U.h("div", { class: "grid2" },
        U.h("div", { class: "card" }, U.h("h3", null, "Data room"), t.docs.map(dd => U.h("div", { class: "attach", style: { display: "flex" } }, "📁 " + dd))),
        U.h("div", { class: "card" }, U.h("h3", null, "10-day checklist"), U.h("ul", { style: { listStyle: "none" } }, t.checklist.map(([day, task], i) => { const done = (Store.state("dd") || {})[i]; return U.h("li", { style: { padding: ".25rem 0" } }, U.h("label", { class: "flex" }, U.h("input", { type: "checkbox", checked: done ? "" : null, onchange: e => { const s = Store.state("dd") || {}; s[i] = e.target.checked; Store.state("dd", s); } }), U.h("b", null, day), " ", task)); })))));
      main.append(U.h("div", { class: "card", style: { marginTop: "1rem" } }, U.h("h3", null, "Interview & analysis notes"), U.h("table", { class: "data" }, U.h("tbody", null, t.notes.map(n => U.h("tr", null, U.h("td", { class: "nowrap" }, U.h("b", null, n[0])), U.h("td", null, n[1])))))));
      main.append(U.h("div", { class: "card", style: { marginTop: "1rem", borderTop: "4px solid #4a6fd1" } }, U.h("h3", null, "Priced verdict"), C.kv([["Integration cost", t.verdict.integrationCost], ["Retention", t.verdict.retention], ["Risk discount", t.verdict.riskDiscount], ["Recommendation", U.h("b", null, t.verdict.recommendation)]])));
    }
  }
});

/* ================= CrisisDesk ================= */
SITE.modules.push({
  id: "crisisdesk", icon: "fire", label: "CrisisDesk", home: "crisisdesk", color: "#c2334d", desc: "Crisis comms & disclosure",
  routes: {
    "crisisdesk": (main) => {
      const c = SEED.crisis;
      main.append(C.crumbs({ label: "CrisisDesk" }), C.pageHead("CrisisDesk — supplier breach", "Started " + c.started + ". Holding statements, the disclosure decision tree, the contact lattice and the cadence tracker."));
      main.append(C.banner("warn", U.h("b", null, "Scenario: "), c.scenario));
      main.append(U.h("div", { class: "grid2" },
        U.h("div", { class: "card" }, U.h("h3", null, "Holding statements"), c.holding.map(h => U.h("div", { style: { background: "var(--toolbar-bg)", border: "1px solid var(--line)", borderRadius: "8px", padding: ".7rem", marginBottom: ".6rem", fontSize: ".88rem" } }, h)),
          U.h("p", { class: "muted small" }, "Approved by Legal + Comms. No speculation on numbers until supplier forensics confirm scope.")),
        U.h("div", { class: "card" }, U.h("h3", null, "Disclosure decision tree"), U.h("table", { class: "data" }, U.h("tbody", null, c.tree.map(([q, a]) => U.h("tr", null, U.h("td", null, U.h("b", null, q)), U.h("td", null, a))))))));
      main.append(U.h("div", { class: "grid2", style: { marginTop: "1rem" } },
        U.h("div", { class: "card" }, U.h("h3", null, "Contact lattice"), U.h("table", { class: "data" }, U.h("tbody", null, c.lattice.map(([r, n]) => U.h("tr", null, U.h("td", null, r), U.h("td", null, n)))))),
        U.h("div", { class: "card" }, U.h("h3", null, "Cadence tracker"), U.h("ul", { style: { listStyle: "none" } }, c.cadence.map(([t, w], i) => { const done = (Store.state("crisis") || {})[i]; return U.h("li", { style: { padding: ".3rem 0" } }, U.h("label", { class: "flex" }, U.h("input", { type: "checkbox", checked: done ? "" : null, onchange: e => { const s = Store.state("crisis") || {}; s[i] = e.target.checked; Store.state("crisis", s); } }), U.h("b", { class: "mono" }, t), " ", w)); })))));
    }
  }
});
