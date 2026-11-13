/* Everline modules: DeliveryBoard, PulseMetrics, ArchHub, ReleaseGate */
"use strict";

/* ================= DeliveryBoard ================= */
SITE.modules.push({
  id: "delivery", icon: "target", label: "DeliveryBoard", home: "delivery", color: "#7a2e8e", desc: "OKRs, plan, programs, commitments",
  routes: {
    "delivery": (main) => {
      main.append(C.crumbs({ label: "DeliveryBoard" }), C.pageHead("DeliveryBoard — portfolio & delivery", "OKRs, the quarterly plan at ~70% capacity with a public cut-line, owner-confidence RAG, P85 commitments with visible trades.",
        U.h("a", { class: "btn sec", href: "#/delivery/fulfilment" }, "Fulfilment 2.0 reset"), U.h("a", { class: "btn sec", href: "#/delivery/atlas" }, "Atlas tracker")));
      const progs = Store.all("programs");
      main.append(U.h("div", { class: "grid4" }, C.stat("Funded programs", progs.length), C.stat("Red / amber", progs.filter(p => p.rag === "Red").length + " / " + progs.filter(p => p.rag === "Amber").length, "amber is rewarded", "warn"), C.stat("Commitments kept (Q3)", "82%", "at P85"), C.stat("Plan capacity", SEED.plan.capacityPct + "%", "30% held for unplanned + debt")));
      main.append(C.tabs("dlv", [
        {
          id: "progs", label: "Program register", render: () => C.table({
            id: "progs", rows: progs, columns: [
              { key: "name", label: "Program", render: r => U.h("b", null, r.name) }, { key: "ownerId", label: "Owner", render: r => EV.name(r.ownerId) },
              { key: "rag", label: "Owner confidence", filter: "select", render: r => C.pill(r.rag) },
              { key: "topRisk", label: "Top risk" }, { key: "budget", label: "Budget", render: r => U.money(r.budget) },
              { key: "burnPct", label: "Burn vs progress", render: r => U.h("span", { class: r.burnPct - r.progressPct > 0.15 ? "down" : "" }, Math.round(r.burnPct * 100) + "% burnt / " + Math.round(r.progressPct * 100) + "% done") },
              { key: "set", label: "", render: r => U.h("select", { onclick: e => e.stopPropagation(), onchange: e => { Store.save("programs", r.id, { rag: e.target.value }, "RAG changed to " + e.target.value, "Owner confidence update"); if (e.target.value === "Amber") Toast.show("Amber is rewarded — early honesty buys options.", "ok"); Router.refresh(); } }, ["Green", "Amber", "Red"].map(x => U.h("option", { selected: r.rag === x ? "" : null }, x))) }],
            onRow: r => Modal.open(r.name + " — RAID log", () => U.h("table", { class: "data" }, U.h("tbody", null, r.raid.map(x => U.h("tr", null, U.h("td", null, C.pill(x.type)), U.h("td", null, x.text), U.h("td", null, EV.name(x.owner)))))))
          })
        },
        {
          id: "okrs", label: "OKRs", render: () => U.h("div", { class: "grid2" }, Store.all("okrs").filter(o => o.level === "Org").map(o => U.h("div", { class: "card" }, U.h("h3", null, o.objective),
            o.krs.map(([k, v]) => U.h("div", { style: { margin: ".4rem 0" } }, U.h("div", { class: "small" }, k), v == null ? U.h("span", { class: "muted small" }, "measured on the day") : U.h("div", { class: "progressbar" }, U.h("i", { style: { width: (v * 100) + "%", background: v < 0.5 ? "var(--warn)" : "var(--ok)" } })))))),
            U.h("div", { class: "card" }, U.h("h3", null, "Squad OKRs"), U.h("ul", { style: { listStyle: "none", fontSize: ".84rem" } }, Store.all("okrs").filter(o => o.level !== "Org").map(o => U.h("li", { style: { padding: ".2rem 0" } }, U.h("b", null, o.level.replace("Squad: ", "")), " — ", o.objective)))))
        },
        {
          id: "plan", label: "Quarterly plan & cut-line", render: () => U.h("div", { class: "card" }, U.h("h3", null, SEED.plan.quarter + " plan at " + SEED.plan.capacityPct + "% capacity"),
            U.h("table", { class: "data" }, U.h("tbody", null, SEED.plan.items.map((it, i) => [
              i === 10 ? U.h("tr", null, U.h("td", { colspan: 3, style: { borderTop: "3px dashed var(--danger)", color: "var(--danger)", fontWeight: 700, fontSize: ".78rem" } }, "— CUT-LINE — everything below is the public “not now” list —")) : null,
              U.h("tr", { style: { opacity: it.aboveLine ? 1 : .55 } }, U.h("td", { class: "mono" }, "#" + it.rank), U.h("td", null, it.title), U.h("td", { class: "right" }, it.points + " pts"))]))),
            U.h("p", { class: "muted small", style: { marginTop: ".5rem" } }, "A visible cut-line ends the hallway lobbying: anything that moves above the line names what drops below it."))
        },
        {
          id: "commit", label: "Commitments (P85)", render: () => U.h("div", null, Store.all("commitments").map(c => U.h("div", { class: "card", style: { marginBottom: ".8rem" } },
            U.h("div", { class: "flex" }, U.h("b", null, c.what), U.h("span", { class: "spacer" }), C.pill("asked by " + c.askedBy, "outline")),
            C.kv([["P50", U.date(c.p50)], ["P85 (committed)", U.date(c.p85) + " (" + U.rel(c.p85) + ")"]]),
            c.changeLog.length ? U.h("ul", { class: "audit" }, c.changeLog.map(x => U.h("li", null, U.h("span", { class: "when" }, U.date(x[0])), U.h("span", null, x[1])))) : U.h("p", { class: "muted small" }, "No trades logged."))),
            C.banner("info", "We commit at P85 and log every trade visibly. Trade a fake date for real ones."))
        },
        {
          id: "deps", label: "Dependency map", render: () => {
            const svg = `<svg viewBox="0 0 640 260" xmlns="http://www.w3.org/2000/svg" role="img" style="width:100%;max-width:760px">
              <defs><marker id="ar" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#6f6478"/></marker></defs>
              ${[["Fulfilment 2.0", 40, 30, "#c2334d"], ["Atlas", 40, 110, "#d97706"], ["Loyalty v2", 40, 190, "#d97706"], ["Carrier API v2 (Logistics Core)", 330, 30, "#c2334d"], ["Golden path v2 (Platform)", 330, 110, "#1f8a5b"], ["CDP (Tessera vendor)", 330, 190, "#d97706"]].map(([t, x, y, c]) => `<rect x="${x}" y="${y}" width="${x > 300 ? 260 : 170}" height="44" rx="10" fill="${c}" opacity=".9"/><text x="${x + 12}" y="${y + 27}" font-size="12" fill="#fff" font-weight="700">${t}</text>`).join("")}
              <path d="M210 52 L330 52" stroke="#6f6478" stroke-width="2" marker-end="url(#ar)"/><text x="232" y="45" font-size="10" fill="#6f6478">'two weeks' × 9 months</text>
              <path d="M210 132 L330 132" stroke="#6f6478" stroke-width="2" marker-end="url(#ar)"/>
              <path d="M210 212 L330 212" stroke="#6f6478" stroke-width="2" marker-end="url(#ar)"/>
              <path d="M210 56 L330 125" stroke="#6f6478" stroke-width="1.4" stroke-dasharray="4 3" marker-end="url(#ar)"/></svg>`;
            return U.h("div", { class: "card" }, U.h("h3", null, "Cross-team dependencies (owners + dates, or they're wishes)"), U.h("div", { html: svg }));
          }
        }
      ]));
    },
    "delivery/fulfilment": (main) => {
      const p = Store.get("programs", "PRG-02");
      main.append(C.crumbs({ label: "DeliveryBoard", href: "#/delivery" }, { label: "Fulfilment 2.0" }), C.pageHead("Fulfilment 2.0 — the red-program reset", "Twelve months in, zero shipped, three re-plans. Every red-program rescue is these five moves wearing different clothes.", C.pill(p.rag)));
      main.append(U.h("div", { class: "grid3" }, SEED.fulfilmentReset.map(([t, d, s], i) => U.h("div", { class: "card", style: { borderTop: "4px solid " + (s === "Done" ? "var(--ok)" : s === "In progress" ? "var(--warn)" : "var(--line)") } },
        U.h("div", { class: "muted small" }, "Move " + (i + 1)), U.h("h3", null, t), U.h("p", { class: "small" }, d), C.pill(s)))));
      main.append(U.h("div", { class: "card", style: { marginTop: "1rem" } }, U.h("h3", null, "Consequences (from the book)"), U.h("p", { class: "small" }, "First live warehouse in seven weeks; the program finishes smaller than dreamed and larger than feared; the sponsor becomes the method's loudest advocate.")));
    },
    "delivery/atlas": (main) => {
      main.append(C.crumbs({ label: "DeliveryBoard", href: "#/delivery" }, { label: "Atlas" }), C.pageHead("Atlas strangler migration tracker", "Facade in front of the monolith; domains peeled one at a time; CDC during cutover; every step reversible; monolith code retired the same quarter it's bypassed."));
      const at = SEED.atlas;
      main.append(U.h("div", { class: "card", style: { marginBottom: "1rem" } }, U.h("h3", null, "Traffic on new services by domain"), Charts.hbars({ items: at.map(a => ({ label: a.domain, value: a.traffic, color: a.traffic === 100 ? "#1f8a5b" : a.traffic ? "#d97706" : "#d9c9e2" })), max: 100, fmt: v => v + "%" })));
      main.append(C.table({ id: "atlas", rows: at.map(a => ({ ...a, id: a.domain })), columns: [{ key: "domain", label: "Domain" }, { key: "status", label: "Status", render: r => C.pill(r.status) }, { key: "traffic", label: "Traffic on new", render: r => r.traffic + "%" }, { key: "cdc", label: "CDC" }, { key: "reversible", label: "Reversible", render: r => r.reversible ? "✓ proven" : "✗" }, { key: "monolithRetired", label: "Monolith code retired", render: r => r.monolithRetired ? C.pill("same quarter", "green") : "—" }, { key: "cutover", label: "Cutover", render: r => r.cutover.length === 10 ? U.date(r.cutover) : r.cutover }] }));
      main.append(C.banner("warn", "The rule organisations break is same-quarter retirement — skip it and you run two systems forever."));
    }
  }
});

/* ================= PulseMetrics ================= */
SITE.modules.push({
  id: "pulsemetrics", icon: "chart", label: "PulseMetrics", home: "pulsemetrics", color: "#4a6fd1", desc: "DORA, flow, DevEx, AI provenance",
  routes: {
    "pulsemetrics": (main) => {
      main.append(C.crumbs({ label: "PulseMetrics" }), C.pageHead("PulseMetrics — engineering metrics", "DORA four keys as a management system, paired with flow and DevEx. Metrics locate conversations, never verdicts; per-engineer activity metrics are explicitly rejected."));
      const D = CANON.dora;
      main.append(U.h("div", { class: "grid4" }, C.stat("Deploys / week", D.deploys[3], "from " + D.deploys[0], "ok"), C.stat("Lead time", D.lead[3] + " d", "from " + D.lead[0] + " d", "ok"), C.stat("Change failure rate", D.cfr[3] + "%", "from " + D.cfr[0] + "% (Q3: " + D.cfr[2] + "%)", "warn"), C.stat("MTTR", D.mttr[3] + " h", "from " + D.mttr[0] + " h", "ok")));
      main.append(C.tabs("pm", [
        {
          id: "dora", label: "DORA by squad", render: () => U.h("div", null,
            U.h("div", { class: "grid2" },
              U.h("div", { class: "card" }, U.h("h3", null, "Deploys/week & lead time (org)"), Charts.line({ labels: D.q, series: [{ label: "Deploys/wk", points: D.deploys }, { label: "Lead time (d)", points: D.lead }] })),
              U.h("div", { class: "card" }, U.h("h3", null, "CFR % & MTTR h (org)"), Charts.line({ labels: D.q, series: [{ label: "CFR %", points: D.cfr }, { label: "MTTR h", points: D.mttr }] }))),
            C.banner("info", U.h("b", null, "Q4 outlier: "), D.outlier + " — metrics locate conversations, never verdicts. Anti-gaming rule: the four keys move together or not at all; never target one alone."),
            C.table({ id: "dora", rows: SEED.dora.map((x, i) => ({ ...x, id: "d" + i })), pageSize: 28, views: [{ label: "Q4 FY26", filter: r => r.quarter === "Q4 FY26" }, { label: "All quarters" }], columns: [{ key: "squad", label: "Squad", filter: "select" }, { key: "quarter", label: "Quarter", filter: "select" }, { key: "deploysPerWeek", label: "Deploys/wk" }, { key: "leadDays", label: "Lead (d)" }, { key: "cfr", label: "CFR %", render: r => U.h("span", { class: r.cfr >= 15 ? "down" : "" }, r.cfr + "%") }, { key: "mttrH", label: "MTTR h" }] }))
        },
        {
          id: "devex", label: "DevEx survey", render: () => U.h("div", { class: "grid2" },
            U.h("div", { class: "card" }, U.h("h3", null, "Top frictions (1–5)"), Charts.hbars({ items: SEED.devex.topFrictions.map(([l, v]) => ({ label: l, value: v, color: v >= 3.5 ? "#c2334d" : "#4a6fd1" })), max: 5, fmt: v => v.toFixed(1) }),
              C.kv([["Responses", SEED.devex.responses], ["Median days to first commit (new joiner)", SEED.devex.firstCommitDays], ["PR wait p50 / p90", SEED.devex.prWaitP50h + "h / " + SEED.devex.prWaitP90h + "h"]])),
            U.h("div", { class: "card" }, U.h("h3", null, "Funded actions (or the survey is theatre)"), U.h("table", { class: "data" }, U.h("tbody", null, SEED.devex.actions.map(a => U.h("tr", null, U.h("td", null, a[0]), U.h("td", null, C.pill(a[1].split(" —")[0])), U.h("td", { class: "small" }, EV.name(a[2]))))))))
        },
        {
          id: "flow", label: "Flow & quality", render: () => U.h("div", { class: "grid2" },
            U.h("div", { class: "card" }, U.h("h3", null, "WIP (items in flight)"), Charts.line({ labels: SEED.months.map(m => m.slice(2)), series: [{ label: "WIP", points: SEED.flow.wip }] })),
            U.h("div", { class: "card" }, U.h("h3", null, "Blocked age (days)"), Charts.line({ labels: SEED.months.map(m => m.slice(2)), series: [{ label: "Blocked age", points: SEED.flow.blockedAgeDays }] })),
            U.h("div", { class: "card" }, U.h("h3", null, "Escape rate (defects found in prod, %)"), Charts.line({ labels: SEED.months.map(m => m.slice(2)), series: [{ label: "Escape %", points: SEED.flow.escapeRate, color: "#c2334d" }] })),
            U.h("div", { class: "card" }, U.h("h3", null, "Build time p50 (minutes)"), Charts.line({ labels: SEED.months.map(m => m.slice(2)), series: [{ label: "Build min", points: SEED.flow.buildMinP50 }] })))
        },
        {
          id: "ai", label: "AI-assisted engineering", render: () => U.h("div", { class: "card" }, U.h("h3", null, "Quality by provenance tier"),
            U.h("table", { class: "data" }, U.h("thead", null, U.h("tr", null, ["Provenance tier", "Share of merged PRs", "CFR", "Review time"].map(h => U.h("th", null, h)))),
              U.h("tbody", null, SEED.aiMetrics.map(a => U.h("tr", null, U.h("td", null, a.tier), U.h("td", null, a.share + "%"), U.h("td", null, a.cfr + "%"), U.h("td", null, a.reviewTimeH + "h"))))),
            U.h("p", { class: "muted small", style: { marginTop: ".5rem" } }, "Provenance tagging lets you argue about AI with data: AI-assisted work isn't degrading CFR, and review time is falling. Measure outcomes by tier, never 'lines generated'."))
        }
      ]));
    }
  }
});

/* ================= ArchHub ================= */
SITE.modules.push({
  id: "archhub", icon: "flow", label: "ArchHub", home: "archhub", color: "#3b1450", desc: "ADRs, reviews, radar, catalogue, capacity",
  routes: {
    "archhub": (main) => {
      main.append(C.crumbs({ label: "ArchHub" }), C.pageHead("ArchHub", "Lightweight governance that helps instead of gatekeeps: ADRs, the Architecture Review Forum, the tech radar, the service catalogue, the priced debt register and the capacity calculator.",
        U.h("a", { class: "btn", href: "#/archhub/review/ARF-2026-031" }, "Review Loyalty v2"), U.h("a", { class: "btn sec", href: "#/archhub/capacity" }, "Capacity calculator")));
      main.append(C.tabs("arch", [
        { id: "adr", label: "ADR registry", render: () => C.table({ id: "adrs", rows: Store.all("adrs"), pageSize: 15, columns: [{ key: "id", label: "ADR", render: r => U.h("span", { class: "mono" }, r.id) }, { key: "title", label: "Decision" }, { key: "status", label: "Status", filter: "select", render: r => C.pill(r.status) }, { key: "date", label: "Date", render: r => U.date(r.date) }, { key: "ownerId", label: "Owner", render: r => EV.name(r.ownerId) }], onRow: r => Modal.open(r.id + " — " + r.title, () => [C.kv([["Status", r.status], ["Owner", EV.name(r.ownerId)], ["Date", U.date(r.date)]]), U.h("p", { class: "small", style: { marginTop: ".6rem" } }, "Context → options considered → decision → consequences. " + r.context)]) }) },
        { id: "arf", label: "Review forum queue", render: () => C.table({ id: "arf", rows: Store.all("archReviews"), columns: [{ key: "id", label: "ARF" }, { key: "title", label: "Design" }, { key: "squad", label: "Squad" }, { key: "submitted", label: "Submitted", render: r => U.date(r.submitted) }, { key: "status", label: "Status", render: r => C.pill(r.status) }], onRow: r => Router.go("archhub/review/" + r.id) }) },
        {
          id: "radar", label: "Tech radar", render: () => {
            const rings = ["Adopt", "Trial", "Assess", "Hold"]; const cols = ["#1f8a5b", "#4a6fd1", "#d97706", "#c2334d"];
            let svg = `<svg viewBox="0 0 420 420" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:420px">`;
            rings.slice().reverse().forEach((r, i) => { const rad = 200 - i * 45; svg += `<circle cx="210" cy="210" r="${rad}" fill="${cols[3 - i]}" opacity=".10" stroke="${cols[3 - i]}" stroke-opacity=".4"/>`; });
            rings.forEach((r, i) => svg += `<text x="214" y="${210 - (65 + i * 45) + 14}" font-size="10" fill="#6f6478">${r}</text>`);
            svg += `<line x1="10" y1="210" x2="410" y2="210" stroke="#d9c9e2"/><line x1="210" y1="10" x2="210" y2="410" stroke="#d9c9e2"/>`;
            const quads = ["Platforms", "Tools", "Techniques", "Languages"];
            SEED.radar.forEach((it, i) => { const ri = rings.indexOf(it.ring), qi = quads.indexOf(it.quadrant); const ang = (qi * 90 + 20 + (i * 37) % 55) * Math.PI / 180; const rr = 30 + ri * 45 + (i * 13) % 30; const x = 210 + rr * Math.cos(ang), y = 210 - rr * Math.sin(ang); svg += `<circle cx="${x}" cy="${y}" r="6" fill="${cols[ri]}"><title>${it.name} — ${it.ring}</title></circle><text x="${x + 8}" y="${y + 3}" font-size="8.5" fill="#261c2c">${it.name}</text>`; });
            svg += "</svg>";
            return U.h("div", { class: "grid2" }, U.h("div", { class: "card" }, U.h("div", { html: svg })), U.h("div", { class: "card" }, rings.map(r => U.h("div", { style: { marginBottom: ".6rem" } }, U.h("b", null, r + ": "), SEED.radar.filter(x => x.ring === r).map(x => x.name).join(", ")))));
          }
        },
        { id: "cat", label: "Service catalogue (120)", render: () => C.table({ id: "apps", rows: Store.all("apps"), pageSize: 20, columns: [{ key: "name", label: "Service", render: r => U.h("span", { class: "mono" }, r.name) }, { key: "domain", label: "Domain", filter: "select" }, { key: "tier", label: "Tier", filter: "select", render: r => C.pill("Tier " + r.tier, r.tier === 1 ? "red" : r.tier === 2 ? "amber" : "gray") }, { key: "slo", label: "SLO" }, { key: "owner", label: "Owner" }, { key: "runtime", label: "Runtime", filter: "select" }, { key: "lifecycle", label: "Lifecycle", filter: "select", render: r => C.pill(r.lifecycle, r.lifecycle === "Retire" ? "red" : r.lifecycle === "Invest" ? "green" : "gray") }] }) },
        { id: "debt", label: "Debt register (priced)", render: () => U.h("div", null, C.banner("info", "Debt priced by interest paid (incidents, slow features, security exposure). 20% of each squad's capacity services the top of this list."), C.table({ id: "debt", rows: U.sort(Store.all("debt"), "score", true), columns: [{ key: "item", label: "Debt item" }, { key: "interest", label: "Interest (1–10)" }, { key: "principal", label: "Principal (cost to fix)" }, { key: "score", label: "Interest ÷ principal", render: r => U.h("b", null, r.score) }, { key: "owner", label: "Owner" }] })) },
        { id: "nfr", label: "NFR budgets", render: () => U.h("div", { class: "card" }, U.h("h3", null, "Checkout p99 ≤ 800 ms end-to-end — decomposed per hop"), Charts.hbars({ items: [["CDN + edge", 60], ["BFF", 90], ["Checkout svc", 160], ["Pricing/promotions", 140], ["Inventory reservation", 120], ["Payments authorise", 180], ["Headroom", 50]].map(([l, v]) => ({ label: l, value: v, color: l === "Headroom" ? "#9a8da3" : "#7a2e8e" })), fmt: v => v + " ms" }), U.h("p", { class: "muted small" }, "NFRs as numbers with owners: each hop's owner signs its slice.")) }
      ]));
    },
    "archhub/review": (main, args) => {
      const r = Store.get("archReviews", args[0]); if (!r) return main.append(C.banner("bad", "Review not found."));
      main.append(C.crumbs({ label: "ArchHub", href: "#/archhub" }, { label: r.id }), C.pageHead(r.title, r.id + " · squad " + r.squad + " · reviewer " + EV.name(r.reviewerId), C.pill(r.status)));
      if (!r.findings.length) { main.append(U.h("p", { class: "muted" }, "No findings recorded.")); return; }
      const revealed = Store.state("loyaltyReveal");
      main.append(C.banner("info", "The craft: questions before verdicts; findings written as risk → consequence → severity → recommendation; the team leaves wanting to come back. Try to list the flaws yourself before revealing the findings memo."));
      if (!revealed) {
        main.append(U.h("div", { class: "card" }, U.h("h3", null, "Design summary (as submitted)"),
          U.h("ul", { style: { paddingLeft: "1.1rem", lineHeight: 1.7, fontSize: ".9rem" } },
            U.h("li", null, "Points and Rewards services share the loyalty Postgres database for 'simplicity'."),
            U.h("li", null, "Both services keep user session state in memory; 'we will scale horizontally' for Black Friday."),
            U.h("li", null, "Clients retry POST /points on timeout (3 attempts, exponential backoff)."),
            U.h("li", null, "v2 replaces v1 at cutover; partners will 'update their integrations'."),
            U.h("li", null, "Capacity: 'Redis will handle it.'")),
          U.h("textarea", { style: { width: "100%", minHeight: "90px", marginTop: ".6rem" }, placeholder: "Your findings first (they're saved to your mission log)…", onchange: e => Store.state("loyaltyMine", e.target.value) }, Store.state("loyaltyMine") || ""),
          U.h("button", { class: "btn", style: { marginTop: ".5rem" }, onclick: () => { Store.state("loyaltyReveal", true); Router.refresh(); } }, "Reveal the findings memo")));
        return;
      }
      main.append(C.table({ id: "arffind", rows: r.findings.map((f, i) => ({ ...f, id: "F" + (i + 1) })), columns: [{ key: "id", label: "#" }, { key: "risk", label: "Risk" }, { key: "consequence", label: "Consequence" }, { key: "severity", label: "Severity", render: f => C.pill(f.severity, f.severity === "Blocker" ? "red" : "amber") }, { key: "rec", label: "Recommendation" }] }));
      main.append(U.h("div", { class: "card", style: { marginTop: "1rem" } }, U.h("h3", null, "Decision"), U.h("p", { class: "small" }, "Two blockers, three advisories. Outcome: 'approve on resubmission' with a two-week path — not a rejection."),
        C.approvalActions("archReviews", r.id, { label: "on resubmission", can: true, onApprove: c => Store.save("archReviews", r.id, { status: "Approve on resubmission" }, "Decision recorded", c), onReject: c => Store.save("archReviews", r.id, { status: "Rejected" }, "Rejected", c) })));
    },
    "archhub/capacity": (main) => {
      main.append(C.crumbs({ label: "ArchHub", href: "#/archhub" }, { label: "Capacity" }), C.pageHead("Black Friday capacity calculator", "'Probably' becomes a dated, costed yes: find which component hits its ceiling first."));
      const st = Store.state("capCalc") || { orders: 26, peakX: 8, writesPerOrder: 3, podTps: 100, shardWrites: 3972, forecastX: 1, shards: 4 };
      const avgTps = st.orders * 1e6 / 86400;
      const peak = avgTps * st.peakX * st.forecastX;
      const writes = peak * st.writesPerOrder;
      const pods = Math.ceil(peak / st.podTps * 1.1);
      const shardCap = st.shards * st.shardWrites;
      const ceilingX = shardCap / (avgTps * st.peakX * st.writesPerOrder);
      const calc = U.h("div", { class: "card" });
      calc.append(U.h("div", { class: "grid4" }, [["orders", "Orders/day (M)"], ["peakX", "Peak multiplier"], ["forecastX", "Campaign forecast (× last year)"], ["writesPerOrder", "DB writes per order"], ["podTps", "TPS per pod"], ["shardWrites", "Writes/s per shard (ceiling)"], ["shards", "Shards"]].map(([k, l]) =>
        U.h("div", { class: "field" }, U.h("label", null, l), U.h("input", { type: "number", step: "any", value: st[k], onchange: e => { st[k] = +e.target.value; Store.state("capCalc", st); Router.refresh(); } })))));
      calc.append(U.h("div", { class: "grid4", style: { marginTop: "1rem" } },
        C.stat("Peak TPS", U.num(peak, 0), "book baseline: " + U.num(CANON.capacity.peakTps, 0)),
        C.stat("DB writes/s", U.num(writes, 0), "book: ~" + U.num(CANON.capacity.dbWrites, 0)),
        C.stat("Pods needed (+10%)", pods, "book: " + CANON.capacity.pods),
        C.stat("Shard utilisation", U.pct(100 * writes / shardCap, 0), "first ceiling at " + ceilingX.toFixed(1) + "× forecast", writes > shardCap ? "bad" : writes > .8 * shardCap ? "warn" : "ok")));
      calc.append(writes > shardCap ? C.banner("bad", "The database shards are the first ceiling. Answer: 'yes, after we split two shards — two weeks — here's the plan', then rehearse it in the load test before the campaign.") : C.banner("info", "Within capacity at this forecast. Rehearse it in the load test anyway — capacity models are hypotheses until tested."));
      calc.append(U.h("div", { class: "flex", style: { marginTop: ".6rem" } }, U.h("button", { class: "btn", onclick: () => { st.forecastX = 3; Store.state("capCalc", st); Router.refresh(); } }, "Try Marcus's 3× forecast"), U.h("button", { class: "btn sec", onclick: () => { st.shards = 6; Store.state("capCalc", st); Router.refresh(); } }, "Split two shards (4 → 6)"),
        U.h("button", { class: "btn ok", onclick: () => { if (writes > shardCap) return Toast.show("Load test would fail at this configuration — fix the ceiling first.", "warn"); Store.state("loadTestPassed", true); Toast.show("Load test signed off at " + st.forecastX + "× forecast.", "ok"); } }, "Sign off load test")));
      main.append(calc);
      main.append(U.h("div", { class: "card", style: { marginTop: "1rem" } }, U.h("h3", null, "The arithmetic"), U.h("p", { class: "small mono" }, `${st.orders}M orders/day ÷ 86,400 s = ${U.num(avgTps, 0)} TPS avg × ${st.peakX} peak × ${st.forecastX} forecast = ${U.num(peak, 0)} TPS → × ${st.writesPerOrder} writes = ${U.num(writes, 0)} writes/s across ${st.shards} shards (${U.num(shardCap, 0)} writes/s ceiling) → ${pods} pods at ${st.podTps} TPS each.`)));
    }
  }
});

/* ================= ReleaseGate ================= */
SITE.modules.push({
  id: "releasegate", icon: "rocket", label: "ReleaseGate", home: "releasegate", color: "#c2334d", desc: "Changes, freeze calendar, exposure",
  routes: {
    "releasegate": (main) => {
      main.append(C.crumbs({ label: "ReleaseGate" }), C.pageHead("ReleaseGate — change & release", "Standard changes are approved by the pipeline itself (the gates are the approval); risky changes go through review. Freeze and slush windows around peak."));
      const ch = Store.all("changes");
      main.append(U.h("div", { class: "grid4" }, C.stat("Changes (±6 weeks)", ch.length), C.stat("Pipeline-approved", U.pct(100 * ch.filter(c => c.class.startsWith("Standard")).length / ch.length, 0), "target ≥ 80%", "ok"), C.stat("Risky scheduled pre-freeze", ch.filter(c => c.class.startsWith("Risky") && c.date >= Clock.today() && c.date < "2026-11-20").length), C.stat("Blocked by freeze", ch.filter(c => c.status.startsWith("Blocked")).length, null, "warn")));
      main.append(U.h("div", { class: "card", style: { margin: "1rem 0" } }, U.h("h3", null, "Freeze calendar"), U.h("table", { class: "data" }, U.h("tbody", null, SEED.freeze.map(f => U.h("tr", null, U.h("td", null, U.date(f.from) + " → " + U.date(f.to)), U.h("td", null, C.pill(f.type, f.type.startsWith("Freeze") ? "red" : "amber")))))),
        U.h("p", { class: "muted small" }, "Why: last year's Black Friday-eve incident (41 minutes, ~18k failed checkouts) began with a connection-pool config change classed as 'standard'. Pool config is now risky-class.")));
      main.append(C.table({
        id: "changes", rows: ch, pageSize: 15, defaultSort: "date", views: [{ label: "Upcoming", filter: r => r.date >= Clock.today() }, { label: "All" }, { label: "Risky only", filter: r => r.class.startsWith("Risky") }],
        columns: [{ key: "id", label: "Change" }, { key: "title", label: "Title" }, { key: "class", label: "Class", filter: "select", render: r => C.pill(r.class, r.class.startsWith("Risky") ? "amber" : "green") }, { key: "squad", label: "Squad", filter: "select" }, { key: "date", label: "Date", render: r => U.date(r.date) },
        { key: "exposure", label: "Exposure", render: r => U.h("span", null, ["1%", "10%", "100%"].map(x => U.h("span", { class: "pill " + (x === r.exposure ? "purple" : "outline"), style: { marginRight: "2px" } }, x))) },
        { key: "status", label: "Status", filter: "select", render: r => C.pill(r.status) },
        { key: "a", label: "", render: r => r.status === "Scheduled" && r.class.startsWith("Risky") ? U.h("div", { onclick: e => e.stopPropagation() }, C.approvalActions("changes", r.id, { can: true, onApprove: c => Store.save("changes", r.id, { status: "Approved — staged rollout" }, "Approved", c), onReject: c => Store.save("changes", r.id, { status: "Rejected" }, "Rejected", c) })) : null }]
      }));
      main.append(U.h("div", { class: "card", style: { marginTop: "1rem" } }, U.h("h3", null, "Exposure stages & rollback criteria"), Charts.flow([{ label: "1% canary", color: "#7a2e8e" }, { label: "10%", color: "#9a4ea8" }, { label: "100%", color: "#1f8a5b" }], { stageW: 130 }), U.h("p", { class: "small" }, "Automatic rollback: error rate > 1% or p99 > 800 ms for 5 minutes at any stage. Bake time: 30 min at 1%, 2 h at 10%.")));
    }
  }
});
