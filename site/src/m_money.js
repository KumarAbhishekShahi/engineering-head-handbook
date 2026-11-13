/* Everline modules: FinancePortal, VendorDesk */
"use strict";

/* ================= FinancePortal ================= */
const FIN_TABS = (active) => U.h("div", { class: "flex-wrap", style: { marginBottom: "1rem" } },
  [["finance", "Budget & variance"], ["finance/cuts", "15% cut planner"], ["finance/finops", "Cloud FinOps"], ["finance/showback", "Showback"], ["finance/prs", "Purchase requests"]].map(([h, l]) =>
    U.h("a", { class: "btn " + (active === h ? "" : "sec") + " sm", href: "#/" + h }, l)));
SITE.modules.push({
  id: "finance", icon: "money", label: "FinancePortal", home: "finance", color: "#1f8a5b", desc: "Budget, variance, cuts, FinOps",
  routes: {
    "finance": (main) => {
      const b = SEED.budget;
      main.append(C.crumbs({ label: "FinancePortal" }), C.pageHead("FinancePortal — budget & variance", "Built bottom-up once a year, managed top-down monthly. Every variance over ±5% carries a one-line cause."), FIN_TABS("finance"));
      const rtb = U.sum(b.lines, "rtb"), ctb = U.sum(b.lines, "ctb");
      main.append(U.h("div", { class: "grid4" },
        C.stat("FY26 budget", U.money(b.total), "Platforms & Commerce"),
        C.stat("RTB share", Math.round(100 * rtb / (rtb + ctb)) + "%", "benchmark unease starts ~70%", "warn"),
        C.stat("CTB (change)", U.money(ctb), "modernisation + programmes"),
        C.stat("Unit cost / order", "$" + b.unitCost[11], "from $" + b.unitCost[0] + " (−17%)", "ok")));
      main.append(U.h("div", { class: "grid2", style: { marginTop: "1rem" } },
        U.h("div", { class: "card" }, U.h("h3", null, "Where the $28.4M goes (RTB vs CTB)"),
          Charts.bars({ labels: b.lines.map(l => l.line.split(" (")[0].replace("Software ", "").replace(" & infrastructure", "")), series: [{ label: "RTB (run)", points: b.lines.map(l => l.rtb) }, { label: "CTB (change)", points: b.lines.map(l => l.ctb) }], stacked: true, fmt: v => U.money(v), h: 220 }),
          U.h("p", { class: "muted small" }, "The shape tells the strategy: 69% keeps the lights on — the number that justifies the modernisation bet better than any architecture slide.")),
        U.h("div", { class: "card" }, U.h("h3", null, "Bottom-up build"),
          U.h("table", { class: "data" }, U.h("thead", null, U.h("tr", null, ["Line", "RTB", "CTB", "Total"].map(h => U.h("th", { class: h === "Line" ? "" : "right" }, h)))),
            U.h("tbody", null, b.lines.map(l => U.h("tr", null, U.h("td", null, l.line), U.h("td", { class: "right" }, U.money(l.rtb)), U.h("td", { class: "right" }, U.money(l.ctb)), U.h("td", { class: "right" }, U.h("b", null, U.money(l.rtb + l.ctb))))),
              U.h("tr", null, U.h("td", null, U.h("b", null, "Total")), U.h("td", { class: "right" }, U.money(rtb)), U.h("td", { class: "right" }, U.money(ctb)), U.h("td", { class: "right" }, U.h("b", null, U.money(rtb + ctb)))))))));
      main.append(U.h("div", { class: "card", style: { marginTop: "1rem" } }, U.h("h3", null, "Monthly forecast vs actual (trailing 12)"),
        Charts.bars({ labels: b.actuals.map(a => a.month.slice(2)), series: [{ label: "Plan", points: b.actuals.map(a => a.plan), color: "#d9c9e2" }, { label: "Actual", points: b.actuals.map(a => a.actual) }], fmt: v => U.money(v) }),
        C.table({
          id: "var", rows: b.actuals.map(a => ({ ...a, id: a.month, varPct: 100 * (a.actual / a.plan - 1) })), pageSize: 12, columns: [
            { key: "month", label: "Month" }, { key: "plan", label: "Plan", render: r => U.money(r.plan) }, { key: "actual", label: "Actual", render: r => U.money(r.actual) },
            { key: "varPct", label: "Variance", render: r => U.h("span", { class: Math.abs(r.varPct) > 5 ? "down" : "" }, (r.varPct > 0 ? "+" : "") + r.varPct.toFixed(1) + "%"), sortVal: r => r.varPct },
            {
              key: "cause", label: "One-line cause (required over ±5%)", render: r => Math.abs(r.varPct) > 5 ? (r.cause || (Store.get("budgetVar", r.month) || {}).cause || U.h("input", {
                type: "text", placeholder: "Missing cause — Dana will ask", style: { width: "100%", borderColor: "var(--danger)" },
                onchange: e => Store.save("budgetVar", r.month, { cause: e.target.value }, "Variance cause added", e.target.value)
              })) : U.h("span", { class: "muted" }, "within tolerance")
            }]
        })));
    },
    "finance/cuts": (main) => {
      const b = SEED.budget;
      main.append(C.crumbs({ label: "FinancePortal", href: "#/finance" }, { label: "15% cut planner" }), C.pageHead("Cut scenario planner", `Group ask: ${CANON.budget.cutPct}% = ${U.money(b.cutTarget)}. Never one number — always priced options with consequences and a recommendation.`), FIN_TABS("finance/cuts"));
      const sel = Store.state("cutSel") || { A: 1, B: 0.75, C: 1 };
      const total = U.sum(b.cutOptions, o => o.saves * (sel[o.id] || 0));
      const card = U.h("div", { class: "card" });
      card.append(U.h("h3", null, "Options — set the share of each you'd take"));
      for (const o of b.cutOptions) {
        card.append(U.h("div", { style: { padding: ".7rem 0", borderBottom: "1px dashed var(--line-soft)" } },
          U.h("div", { class: "flex" }, U.h("b", null, "Option " + o.id + " — " + o.label), U.h("span", { class: "spacer" }), C.pill("risk: " + o.risk), U.h("b", { style: { marginLeft: ".6rem" } }, U.money(o.saves))),
          U.h("div", { class: "muted small" }, "Consequence: " + o.consequence),
          U.h("div", { class: "flex", style: { marginTop: ".3rem" } }, U.h("input", { type: "range", min: 0, max: 1, step: 0.25, value: sel[o.id] || 0, "aria-label": "Share of option " + o.id, oninput: e => { sel[o.id] = +e.target.value; Store.state("cutSel", sel); Router.refresh(); } }), U.h("span", { class: "small" }, Math.round(100 * (sel[o.id] || 0)) + "% → " + U.money(o.saves * (sel[o.id] || 0))))));
      }
      main.append(U.h("div", { class: "grid2" }, card,
        U.h("div", null,
          U.h("div", { class: "card" }, U.h("h3", null, "Against the target"),
            Charts.gauge(total / b.cutTarget, { label: U.money(total), sub: "target " + U.money(b.cutTarget), color: total >= b.cutTarget ? "#1f8a5b" : "#d97706" }),
            total >= b.cutTarget ? C.banner("info", "Target met. " + (sel.B < 1 ? "Permanent staff protected; " : "") + "consequences listed per option.") : C.banner("warn", "Short by " + U.money(b.cutTarget - total) + ". Dana needs the full number — or an explicit argument for why not.")),
          U.h("div", { class: "card", style: { marginTop: "1rem" } }, U.h("h3", null, "Book recommendation"), U.h("p", { class: "small" }, b.recommended + ". Rebuilding a team costs two years; the cut will be forgotten in one."),
            U.h("button", {
              class: "btn", onclick: () => {
                if (total < b.cutTarget) return Toast.show("Below target — Dana will send it back. Adjust or argue explicitly.", "warn");
                Store.state("cutSubmitted", true); Store.audit("budgetVar", "cut-submission", "Cut options submitted to Dana", "Total " + U.money(total));
                Toast.show("Submitted to Dana: " + U.money(total) + " with consequences priced.", "ok"); Router.refresh();
              }
            }, Store.state("cutSubmitted") ? "✓ Submitted — resubmit" : "Submit options to Dana")))));
    },
    "finance/finops": (main) => {
      const b = SEED.budget;
      main.append(C.crumbs({ label: "FinancePortal", href: "#/finance" }, { label: "Cloud FinOps" }), C.pageHead("Cloud FinOps", "Unit economics, the untagged-spend shame line, rightsizing, scheduling and commitments."), FIN_TABS("finance/finops"));
      main.append(U.h("div", { class: "grid2" },
        U.h("div", { class: "card" }, U.h("h3", null, "Unit cost per order ($)"), Charts.line({ labels: SEED.months.map(m => m.slice(2)), series: [{ label: "$/order", points: b.unitCost }], fmt: v => "$" + v.toFixed(3) }), U.h("p", { class: "muted small" }, "$" + CANON.budget.unitCostFrom + " → $" + CANON.budget.unitCostTo + ". Cost per outcome beside cost per line changes every exec conversation.")),
        U.h("div", { class: "card" }, U.h("h3", null, "Untagged spend — the shame line (%)"), Charts.line({ labels: SEED.months.map(m => m.slice(2)), series: [{ label: "untagged %", points: b.untaggedPct, color: "#c2334d" }], goal: 5, fmt: v => v + "%" }), U.h("p", { class: "muted small" }, "Every resource tagged to an owning squad; untagged spend sits on the dashboard where everyone can see it."))));
      main.append(U.h("div", { class: "card", style: { marginTop: "1rem" } }, U.h("h3", null, "Savings levers"),
        U.h("table", { class: "data" }, U.h("thead", null, U.h("tr", null, ["Lever", "Annual saving", "Effort", "Status"].map(h => U.h("th", null, h)))),
          U.h("tbody", null, [["Rightsize over-provisioned k8s nodes (p95 CPU < 20%)", 310000, "Low", "Done"], ["Schedule non-prod off nights/weekends", 180000, "Low", "Done"], ["1-year compute commitments (60% of baseline)", 260000, "Low", "In progress"], ["Licence rationalisation (3 overlapping tools)", 150000, "Medium", "Planned"], ["Storage lifecycle (logs > 30d to cold tier)", 70000, "Low", "Planned"]].map(x => U.h("tr", null, U.h("td", null, x[0]), U.h("td", null, U.money(x[1])), U.h("td", null, x[2]), U.h("td", null, C.pill(x[3])))))),
        U.h("p", { class: "muted small", style: { marginTop: ".5rem" } }, "Option C of the cut ($0.9M) is these levers, already evidenced.")));
    },
    "finance/showback": (main) => {
      main.append(C.crumbs({ label: "FinancePortal", href: "#/finance" }, { label: "Showback" }), C.pageHead("Showback by business line", "Showback before chargeback: each line sees its consumption and unit cost before money moves — survive the screams first."), FIN_TABS("finance/showback"));
      const rows = SEED.showback.map(s => ({ ...s, id: s.line, unit: s.cloud / s.orders }));
      main.append(U.h("div", { class: "grid2" },
        U.h("div", { class: "card" }, U.h("h3", null, "Cloud cost by business line"), Charts.donut({ items: rows.map(r => ({ label: r.line, value: r.cloud })), centre: U.money(U.sum(rows, "cloud")) })),
        C.table({ id: "showback", rows, columns: [{ key: "line", label: "Business line" }, { key: "cloud", label: "Cloud cost", render: r => U.money(r.cloud) }, { key: "orders", label: "Orders", render: r => U.num(r.orders / 1e6, 0) + "M" }, { key: "unit", label: "$/order", render: r => "$" + r.unit.toFixed(4), sortVal: r => r.unit }] })));
    },
    "finance/prs": (main) => {
      main.append(C.crumbs({ label: "FinancePortal", href: "#/finance" }, { label: "Purchase requests" }), C.pageHead("Purchase requests & approval limits", "Limits: Director ≤ $50k · Head of Engineering ≤ $250k · CIO > $250k. Capex/opex tagged at request."), FIN_TABS("finance/prs"));
      main.append(C.table({
        id: "prs", rows: Store.all("purchaseReqs"), columns: [
          { key: "id", label: "PR", render: r => U.h("span", { class: "mono" }, r.id) }, { key: "title", label: "Request" },
          { key: "amount", label: "Amount", render: r => U.money(r.amount) }, { key: "limit", label: "Approval limit" },
          { key: "capex", label: "Capex/Opex", render: r => C.pill(r.capex ? "Capex" : "Opex", r.capex ? "purple" : "gray") },
          { key: "requesterId", label: "Requester", render: r => EV.name(r.requesterId) },
          { key: "status", label: "Status", render: r => C.pill(r.status) },
          {
            key: "a", label: "", render: r => r.status === "Pending approval" ? (r.amount > 250000 && Personas.isYou() ? U.h("span", { class: "muted small" }, "Above your limit — CIO") : U.h("div", { onclick: e => e.stopPropagation() }, C.approvalActions("purchaseReqs", r.id, { can: true, requester: Store.get("people", r.requesterId) && Personas.current().personId === r.requesterId ? r.requesterId : null, onApprove: c => Store.save("purchaseReqs", r.id, { status: "Approved" }, "Approved", c), onReject: c => Store.save("purchaseReqs", r.id, { status: "Rejected" }, "Rejected", c) }))) : null
          }]
      }));
    }
  }
});

/* ================= VendorDesk ================= */
SITE.modules.push({
  id: "vendordesk", icon: "truck", label: "VendorDesk", home: "vendordesk", color: "#d97706", desc: "Vendors, QBRs, RFPs, renewals, exits",
  routes: {
    "vendordesk": (main) => {
      main.append(C.crumbs({ label: "VendorDesk" }), C.pageHead("VendorDesk", "Fourteen vendors, tiered by blast radius. QBRs on outcomes, RFPs with locked weights, and exits priced before renewals.",
        U.h("a", { class: "btn sec", href: "#/vendordesk/qbr" }, "QBR builder"), U.h("a", { class: "btn sec", href: "#/vendordesk/rfp" }, "RFP"), U.h("a", { class: "btn sec", href: "#/vendordesk/invoices" }, "Invoices & timesheets")));
      const vs = Store.all("vendors");
      main.append(U.h("div", { class: "grid4" }, C.stat("Vendors", vs.length), C.stat("Annual spend", U.money(U.sum(vs, "annualSpend"))), C.stat("Contract seats", U.sum(vs, "seats"), "of 90 vendor engineers"), C.stat("Renewals ≤ 90 days", vs.filter(v => U.daysBetween(Clock.today(), v.renewal) <= 90).length, "Kestrel is the hard one", "warn")));
      main.append(U.h("div", { style: { marginTop: "1rem" } }, C.table({
        id: "vendors", rows: vs, pageSize: 14, columns: [
          { key: "name", label: "Vendor", render: r => U.h("span", null, U.h("b", null, r.name), U.h("span", { class: "sub" }, r.service)) },
          { key: "tier", label: "Tier", filter: "select", render: r => C.pill(r.tier, r.tier === "Critical" ? "red" : r.tier === "High" ? "amber" : "gray") },
          { key: "annualSpend", label: "Spend", render: r => U.money(r.annualSpend), sortVal: r => r.annualSpend },
          { key: "seats", label: "Seats", render: r => r.seats || "—" },
          { key: "renewal", label: "Renewal", render: r => U.h("span", { class: "sla " + U.dueClass(r.renewal, 90) }, U.date(r.renewal)) },
          { key: "sla", label: "SLA", render: r => r.sla + "%" },
          { key: "clauses", label: "Clause gaps", render: r => { const g = Object.entries(r.clauses).filter(([, v]) => !v).map(([k]) => k); return g.length ? C.pill(g.length + " gap" + (g.length > 1 ? "s" : ""), "red") : C.pill("complete", "green"); } }],
        onRow: r => Router.go("vendordesk/v/" + r.id)
      })));
    },
    "vendordesk/v": (main, args) => {
      const v = Store.get("vendors", args[0]); if (!v) return main.append(C.banner("bad", "Vendor not found."));
      main.append(C.crumbs({ label: "VendorDesk", href: "#/vendordesk" }, { label: v.name }), C.pageHead(v.name, v.service, C.pill(v.tier)));
      const left = U.h("div", { class: "card" }, U.h("h3", null, "Contract"), C.kv([["Annual spend", U.money(v.annualSpend)], ["Renewal", U.date(v.renewal) + " (" + U.rel(v.renewal) + ")"], ["Seats", v.seats || "—"], ["Rate card ($/h)", v.rateCard ? Object.entries(v.rateCard).map(([k, x]) => k + " " + x).join(" · ") : "—"], ["SLA (trailing)", v.sla + "%"], ["Vendor-side attrition", v.attritionVendorSide ? v.attritionVendorSide + "%" : "—"], v.notes ? ["Notes", v.notes] : null]),
        U.h("h3", { style: { marginTop: "1rem" } }, "Clause check"), C.gateChecklist(Object.entries(v.clauses).map(([k, ok]) => ({ label: k, ok }))));
      const right = U.h("div", { class: "card" }, U.h("h3", null, "Scorecard"), Charts.hbars({ items: Object.entries(v.scorecard).map(([k, x]) => ({ label: k, value: x })), max: 5, fmt: x => x + "/5" }));
      main.append(U.h("div", { class: "grid2" }, left, right));
      if (v.id === "VEN-001") {
        // Exit pricing calculator
        const st = Store.state("exitCalc") || { rise: CANON.wms.rise, termYears: 3, exitCost: 3.1, exitMonths: 14, dualRunPct: 50 };
        const base = v.annualSpend;
        const calc = U.h("div", { class: "card", style: { marginTop: "1rem", borderTop: "4px solid #f07d1a" } });
        const renewCost = base * (1 + st.rise / 100) * st.termYears;
        const exitTotal = st.exitCost * 1e6 + base * (st.exitMonths / 12) * (st.dualRunPct / 100) + base * Math.max(0, st.termYears - st.exitMonths / 12) * 0.55;
        calc.append(U.h("h3", null, "Exit pricing calculator — the Kestrel renewal"),
          U.h("p", { class: "small muted" }, "You do not need to exit to benefit from being able to. A credible, priced exit is the only negotiating position vendors fully respect — and it must be built before the renewal."),
          U.h("div", { class: "grid3" }, [["rise", "Renewal uplift asked (%)"], ["termYears", "Contract term (years)"], ["exitCost", "Exit build cost ($M)"], ["exitMonths", "Exit duration (months)"], ["dualRunPct", "Dual-run cost during exit (% of fee)"]].map(([k, l]) =>
            U.h("div", { class: "field" }, U.h("label", null, l), U.h("input", { type: "number", step: "any", value: st[k], onchange: e => { st[k] = +e.target.value; Store.state("exitCalc", st); Router.refresh(); } })))),
          U.h("div", { class: "grid3", style: { marginTop: ".8rem" } },
            C.stat("Renew at +" + st.rise + "% over term", U.money(renewCost)),
            C.stat("Exit (strangler on integration layer)", U.money(exitTotal), "incl. dual-run + successor run-cost at 55%"),
            C.stat("Cheaper path", exitTotal < renewCost ? "Exit" : "Renew", exitTotal < renewCost ? "the rise costs more than leaving" : "renewal is rational at this uplift", exitTotal < renewCost ? "ok" : "warn")),
          U.h("div", { style: { marginTop: ".8rem" } }, U.h("button", { class: "btn", onclick: () => { Store.state("exitPriced", true); Store.audit("vendors", v.id, "Exit priced for negotiation", "Renew " + U.money(renewCost) + " vs exit " + U.money(exitTotal)); Toast.show("Exit position saved. Book outcome: the rise became 8% with two roadmap commitments.", "ok"); Router.refresh(); } }, Store.state("exitPriced") ? "✓ Exit position saved" : "Save as negotiation position")));
        main.append(calc);
      }
      main.append(U.h("div", { class: "card", style: { marginTop: "1rem" } }, U.h("h3", null, "Audit trail"), C.auditTrail("vendors", v.id)));
    },
    "vendordesk/qbr": (main) => {
      main.append(C.crumbs({ label: "VendorDesk", href: "#/vendordesk" }, { label: "QBR builder" }), C.pageHead("Vendor QBR builder", "QBRs on outcomes, recorded against the contract — so the relationship has a factual history, not a vibes history.", U.h("button", { class: "btn sec noprint", onclick: () => window.print() }, "⎙ Print")));
      for (const q of Store.all("qbrs")) {
        const v = Store.get("vendors", q.vendorId);
        main.append(U.h("div", { class: "card report-page", style: { marginBottom: "1rem" } },
          U.h("h3", null, v.name + " — " + q.quarter + " QBR", " ", C.pill("score " + q.score + "/5", q.score < 3 ? "red" : "amber")),
          U.h("div", { class: "grid4" }, C.stat("SLA performance", q.slaHit), C.stat("Roadmap promises kept", q.promisesKept), C.stat("Incidents caused", q.incidents), C.stat("Vendor-side attrition", q.vendorAttrition)),
          U.h("h3", { style: { marginTop: ".8rem" } }, "Scorecard"), Charts.hbars({ items: Object.entries(v.scorecard).map(([k, x]) => ({ label: k, value: x })), max: 5, fmt: x => x + "/5" }),
          U.h("h3", null, "Actions agreed"), U.h("ol", { style: { paddingLeft: "1.2rem" } }, q.actions.map(a => U.h("li", null, a)))));
      }
    },
    "vendordesk/rfp": (main) => {
      const rfp = SEED.rfp;
      main.append(C.crumbs({ label: "VendorDesk", href: "#/vendordesk" }, { label: "RFP" }), C.pageHead(rfp.title, rfp.id + " · weights locked " + U.date(rfp.lockedOn) + " — before any demo"));
      const tot = vv => U.sum(Object.entries(rfp.weights), ([k, w]) => w * vv.scores[k]) / 5;
      main.append(U.h("div", { class: "tablewrap" }, U.h("div", { class: "tscroll" }, U.h("table", { class: "data" },
        U.h("thead", null, U.h("tr", null, U.h("th", null, "Criterion (weight)"), rfp.vendors.map(vv => U.h("th", null, vv.name)))),
        U.h("tbody", null, Object.entries(rfp.weights).map(([k, w]) => U.h("tr", null, U.h("td", null, k + " (" + w + "%)"), rfp.vendors.map(vv => U.h("td", null, vv.scores[k] + "/5")))),
          U.h("tr", null, U.h("td", null, U.h("b", null, "Weighted total (/100)")), rfp.vendors.map(vv => U.h("td", null, U.h("b", null, tot(vv).toFixed(0))))))))));
      main.append(U.h("div", { class: "card", style: { marginTop: "1rem" } }, U.h("h3", null, "Pilot results"), U.h("p", null, rfp.pilot), U.h("p", { class: "muted small" }, "Scored independently by three reviewers; scores submitted before the group discussion. Exit & portability carries 20% — negotiated at signing while the vendor still wants you.")));
    },
    "vendordesk/invoices": (main) => {
      main.append(C.crumbs({ label: "VendorDesk", href: "#/vendordesk" }, { label: "Invoices" }), C.pageHead("Invoices, timesheets & seat ramps", "Invoices reconcile against timesheets and SOW rate cards before approval."));
      main.append(C.table({
        id: "inv", rows: Store.all("invoices"), pageSize: 15, defaultSort: "month", columns: [
          { key: "id", label: "Invoice", render: r => U.h("span", { class: "mono" }, r.id) }, { key: "vendorId", label: "Vendor", render: r => Store.get("vendors", r.vendorId).name, filterVal: r => Store.get("vendors", r.vendorId).name, filter: "select" },
          { key: "month", label: "Month" }, { key: "amount", label: "Amount", render: r => U.money(r.amount) },
          { key: "variance", label: "vs SOW", render: r => U.h("span", { class: Math.abs(r.variance) > 5 ? "down" : "" }, (r.variance > 0 ? "+" : "") + r.variance + "%") },
          { key: "status", label: "Status", filter: "select", render: r => C.pill(r.status) },
          { key: "a", label: "", render: r => r.status === "Pending approval" ? U.h("div", { onclick: e => e.stopPropagation() }, C.approvalActions("invoices", r.id, { can: true, onApprove: c => Store.save("invoices", r.id, { status: "Approved" }, "Approved", c), onReject: c => Store.save("invoices", r.id, { status: "Disputed" }, "Disputed", c) })) : null }]
      }));
      main.append(U.h("div", { class: "card", style: { marginTop: "1rem" } }, U.h("h3", null, "Seat ramp plan (vendor engineers)"),
        Charts.bars({ labels: ["Q1", "Q2", "Q3", "Q4", "Q1 FY27 (opt. B)"], series: [{ label: "Brightpath", points: [48, 52, 52, 52, 37] }, { label: "Coralline", points: [22, 26, 26, 26, 11] }, { label: "Others", points: [10, 12, 12, 12, 12] }], stacked: true, fmt: v => U.num(v, 0) }),
        U.h("p", { class: "muted small" }, "Option B of the cut ramps down 30 seats; vendor engineers sit inside squads under the same standards, with access tiers and IP terms — the difference is contractual, not social.")));
    }
  }
});
