/* Everline modules: Command Center, TalentHub, PeopleHub */
"use strict";
const EV = {
  eng() { return Store.all("people").filter(p => p.squad || p.role.startsWith("Director") || p.dept === "Office of the Head"); },
  name(id) { const p = Store.get("people", id); return p ? p.name : id; },
  bandFmt(r) { return `${r.bandK[0]}k–${r.bandK[1]}k ${r.currency === "INR" ? "USD-equiv (paid in INR)" : r.currency}`; },
  doraOrg() { return SEED.dora.filter(x => x.squad === "Org average"); }
};

/* ================= Command Center ================= */
SITE.modules.push({
  id: "cc", icon: "home", label: "Command Center", home: "cc", color: "#6a2380", desc: "Your day at a glance",
  routes: {
    "cc": (main) => {
      const me = Personas.current();
      const bfDays = U.daysBetween(Clock.today(), CANON.blackFriday);
      main.append(C.crumbs({ label: "Command Center" }), C.pageHead("Command Center",
        me.id === "you" ? `Morning, Asha. Black Friday in ${bfDays} days.` : `Viewing as ${me.name} (${me.role}).`));
      const b = SEED.budget; const ytdVar = U.sum(b.actuals, "actual") - U.sum(b.actuals, "plan");
      const dq = EV.doraOrg();
      const openInc = Store.all("incidents").filter(i => !String(i.status).startsWith("Closed"));
      const slos = Store.all("slos");
      if (me.id === "dana") {
        main.append(U.h("div", { class: "grid4" }, C.stat("Budget", U.money(b.total), "RTB " + b.rtbPct + "%"), C.stat("Trailing-12 variance", U.money(ytdVar), U.pct(100 * ytdVar / U.sum(b.actuals, "plan"))), C.stat("Unit cost / order", "$" + b.unitCost[11], "from $" + b.unitCost[0], "ok"), C.stat("Cut target", U.money(b.cutTarget), Store.state("cutSubmitted") ? "options received" : "options due 5 Nov", Store.state("cutSubmitted") ? "ok" : "warn")));
        main.append(U.h("div", { class: "card", style: { marginTop: "1rem" } }, U.h("h3", null, "What Dana asks Asha for"), U.h("ul", { style: { paddingLeft: "1.1rem" } }, U.h("li", null, "Forecast vs actual with a one-line cause per ±5% line"), U.h("li", null, "Unit costs and showback"), U.h("li", null, "Priced cut options — never a plea, never a single sacrificial number"))));
        return;
      }
      if (me.id === "viktor") {
        main.append(U.h("div", { class: "grid4" }, C.stat("Commitments kept (Q3)", "82%", "P85 discipline"), C.stat("Programs red", Store.all("programs").filter(p => p.rag === "Red").length, "Fulfilment 2.0 in reset", "bad"), C.stat("Lead time", dq[3].leadDays + " days", "from " + dq[0].leadDays), C.stat("Senior attrition", SEED.attrition.seniorNow + "%", "from " + SEED.attrition.seniorH1 + "%", "ok")));
        main.append(U.h("div", { class: "card", style: { marginTop: "1rem" } }, U.h("h3", null, "Viktor's view: top risks"), U.h("ol", { style: { paddingLeft: "1.2rem" } }, Store.all("programs").filter(p => p.rag !== "Green").map(p => U.h("li", null, U.h("b", null, p.name + ": "), p.topRisk, " ", C.pill(p.rag))))));
        return;
      }
      main.append(U.h("div", { class: "grid4" },
        C.stat("Black Friday", bfDays + " days", "freeze from 20 Nov", bfDays < 10 ? "bad" : "warn"),
        C.stat("Checkout SLO budget burn", slos[0].burnPct + "%", CANON.slo.target + " = " + CANON.slo.monthlyBudgetMin + " min / month", slos[0].burnPct > 80 ? "bad" : "ok"),
        C.stat("Budget variance (T12)", U.money(ytdVar), "of " + U.money(b.total), Math.abs(ytdVar) > 0.02 * b.total ? "warn" : "ok"),
        C.stat("Open incidents / actions", openInc.length, "postmortem actions tracked", openInc.length > 8 ? "warn" : "")));
      main.append(U.h("div", { class: "grid3", style: { marginTop: "1rem" } },
        U.h("div", { class: "card" }, U.h("h3", null, "Approvals waiting"),
          U.h("ul", { style: { listStyle: "none", fontSize: ".86rem" } },
            Store.all("purchaseReqs").filter(p => p.status === "Pending approval").map(p => U.h("li", { style: { padding: ".3rem 0", borderBottom: "1px dashed var(--line-soft)" } }, U.h("a", { href: "#/finance/prs" }, p.title), " ", U.h("span", { class: "muted small" }, U.money(p.amount)))),
            Store.all("reqs").filter(r => r.status === "Pending approval").slice(0, 3).map(r => U.h("li", { style: { padding: ".3rem 0", borderBottom: "1px dashed var(--line-soft)" } }, U.h("a", { href: "#/talenthub/req/" + r.id }, "Req: " + r.title))),
            Store.all("invoices").filter(i => i.status !== "Paid").slice(0, 3).map(i => U.h("li", { style: { padding: ".3rem 0" } }, U.h("a", { href: "#/vendordesk/invoices" }, "Invoice " + i.id), " ", C.pill(i.status))))),
        U.h("div", { class: "card" }, U.h("h3", null, "DORA (org average, year one)"),
          Charts.line({ labels: CANON.dora.q, series: [{ label: "Lead time (days)", points: CANON.dora.lead }, { label: "MTTR (h)", points: CANON.dora.mttr }], fmt: v => U.num(v) }),
          U.h("p", { class: "muted small" }, "Deploys/wk " + CANON.dora.deploys[0] + " → " + CANON.dora.deploys[3] + " · CFR " + CANON.dora.cfr[0] + "% → " + CANON.dora.cfr[3] + "%")),
        U.h("div", { class: "card" }, U.h("h3", null, "People signals"),
          C.kv([["Attrition", SEED.attrition.overall + "% (market " + SEED.attrition.market + "%)"], ["Senior attrition", SEED.attrition.seniorH1 + "% → " + SEED.attrition.seniorNow + "%"], ["Open reqs", Store.all("reqs").filter(r => r.status === "Open").length], ["Active PIPs", Store.all("pips").filter(p => p.status === "Active").length], ["Engagement", SEED.engagement.score + " (was " + SEED.engagement.prev + ")"]]))));
      const today = Clock.today();
      main.append(U.h("div", { class: "grid2", style: { marginTop: "1rem" } },
        U.h("div", { class: "card" }, U.h("h3", null, "Today & next"),
          U.h("ul", { style: { listStyle: "none", fontSize: ".86rem" } }, U.sort(SEED.calendar.filter(e => e.date >= today), "date").slice(0, 7).map(e => U.h("li", { style: { padding: ".25rem 0" } }, U.h("span", { class: "sla " + U.dueClass(e.date, 2) }, U.rel(e.date)), " — ", U.h("a", { href: e.link }, e.title))))),
        U.h("div", { class: "card" }, U.h("h3", null, "Messages that need you ", U.h("span", { class: "spacer" }), U.h("a", { class: "small", href: "#/mail" }, "EverMail ›")),
          U.h("ul", { style: { listStyle: "none", fontSize: ".86rem" } }, Store.all("messages").filter(m => m.urgency === "high").map(ms => U.h("li", { style: { padding: ".25rem 0" } }, C.pill("urgent", "red"), " ", U.h("a", { href: "#/mail/" + ms.id }, ms.subject)))))));
    }
  }
});

/* ================= TalentHub ================= */
const TH_STAGES = ["Applied", "Recruiter screen", "Hiring manager", "Onsite loop", "Debrief", "Offer", "Hired"];
SITE.modules.push({
  id: "talenthub", icon: "people", label: "TalentHub", home: "talenthub", color: "#f07d1a", desc: "Hiring: reqs, pipeline, loops, offers",
  navCount: () => Store.all("reqs").filter(r => r.status === "Pending approval").length || null,
  routes: {
    "talenthub": (main) => {
      main.append(C.crumbs({ label: "TalentHub" }), C.pageHead("TalentHub — hiring",
        "Headcount plan vs approved reqs, the candidate pipeline, structured loops and offers with band checks.",
        U.h("a", { class: "btn", href: "#/talenthub/newreq" }, "+ New requisition"), U.h("a", { class: "btn sec", href: "#/talenthub/reports" }, "Reports")));
      const reqs = Store.all("reqs"), cands = Store.all("candidates");
      main.append(U.h("div", { class: "grid4" },
        C.stat("Open reqs", reqs.filter(r => r.status === "Open").length, "headcount plan: 42"),
        C.stat("Active candidates", cands.filter(c => !["Hired", "Rejected"].includes(c.stage)).length),
        C.stat("Median time-to-fill", "54 days", "target 45", "warn"),
        C.stat("Diverse slates", U.pct(100 * cands.filter(c => c.diverse).length / cands.length, 0), "of candidates")));
      main.append(C.tabs("th", [
        {
          id: "pipe", label: "Pipeline (kanban)", render: () => C.kanban({
            columns: TH_STAGES.map(s => ({ id: s, label: s })),
            cards: cands.filter(c => c.stage !== "Rejected"),
            colOf: c => c.stage,
            renderCard: c => U.h("div", { class: "kcard", onclick: () => Router.go("talenthub/cand/" + c.id) },
              U.h("div", { class: "flex" }, C.avatar(c.name, 22), U.h("span", { class: "t" }, c.name)),
              U.h("div", { class: "muted small" }, (Store.get("reqs", c.reqId) || {}).title),
              U.h("div", { class: "meta" }, C.pill(c.source.split(":")[0], "outline"), U.h("span", { class: "muted small" }, c.days + "d in stage"))),
            onMove: (c, to) => {
              if (TH_STAGES.indexOf(to) < TH_STAGES.indexOf(c.stage)) return "Candidates move forward or get rejected with a reason — not backwards.";
              if (to === "Offer" && !Object.keys(c.scores || {}).length) return "No offer without scorecards from the full loop.";
              if (to === "Offer" && Math.min(...Object.values(c.scores)) < 3) { Modal.open("Offer blocked by debrief", () => [U.h("p", null, "One or more loop scores are below the 3/5 bar. The debrief decides on evidence against the rubric — open the candidate to record the decision.")]); return "Blocked: scores below bar."; }
              Store.save("candidates", c.id, { stage: to, days: 0 }, "Moved to " + to, ""); return true;
            }
          })
        },
        {
          id: "reqs", label: "Requisitions", render: () => C.table({
            id: "reqs", rows: reqs, pageSize: 15, columns: [
              { key: "id", label: "Req", render: r => U.h("span", { class: "mono" }, r.id) },
              { key: "title", label: "Role" }, { key: "level", label: "Level", filter: "select" }, { key: "site", label: "Site", filter: "select" },
              { key: "squad", label: "Squad" }, { key: "status", label: "Status", filter: "select", render: r => C.pill(r.status) },
              { key: "opened", label: "Age", render: r => U.daysBetween(r.opened, Clock.today()) + "d", sortVal: r => r.opened },
              { key: "c", label: "Candidates", render: r => cands.filter(c => c.reqId === r.id).length }],
            onRow: r => Router.go("talenthub/req/" + r.id)
          })
        },
        {
          id: "plan", label: "Headcount plan", render: () => {
            const sq = Store.all("squads");
            return U.h("div", { class: "card" }, U.h("h3", null, "Plan vs approved by director"),
              Charts.bars({ labels: SEED.squads.filter((s, i) => i % 3 === 0).map(s => EV.name(s.directorId).split(" ")[0]), series: [{ label: "Planned hires", points: [8, 6, 9, 7, 6, 6] }, { label: "Approved reqs", points: Object.values(U.group(reqs, r => r.squad)).slice(0, 6).map(x => x.length) }], fmt: v => U.num(v, 0) }));
          }
        },
        {
          id: "agencies", label: "Agencies", render: () => U.h("div", { class: "card" }, U.h("h3", null, "Agency & source performance"),
            U.h("table", { class: "data" }, U.h("thead", null, U.h("tr", null, ["Source", "Candidates", "Reached onsite", "Hired", "Pass-through"].map(h => U.h("th", null, h)))),
              U.h("tbody", null, Object.entries(U.group(cands, "source")).map(([s, xs]) => { const on = xs.filter(c => ["Onsite loop", "Debrief", "Offer", "Hired"].includes(c.stage)).length, hi = xs.filter(c => c.stage === "Hired").length; return U.h("tr", null, U.h("td", null, s), U.h("td", null, xs.length), U.h("td", null, on), U.h("td", null, hi), U.h("td", null, U.pct(100 * on / xs.length, 0))); }))),
            U.h("p", { class: "muted small", style: { marginTop: ".5rem" } }, "Agencies are measured on pass-through to onsite, not CV volume. TalentBridge's re-loop request on Gavin Holt is in EverMail."))
        }
      ]));
    },
    "talenthub/newreq": (main) => {
      main.append(C.crumbs({ label: "TalentHub", href: "#/talenthub" }, { label: "New requisition" }), C.pageHead("New requisition", "Approval chain: director → Head of Engineering → HRBP → Finance (if over plan)."));
      main.append(C.form({
        draftKey: "newreq", submitLabel: "Submit for approval", pages: [{
          title: "Requisition", fields: [
            { key: "title", label: "Role title", required: true },
            { key: "level", label: "Level", type: "select", required: true, options: ["L3", "L4", "L5", "L6", "M3", "E6"] },
            { key: "site", label: "Location", type: "select", required: true, options: CANON.org.sites },
            { key: "costCentre", label: "Cost centre", required: true, help: "e.g. CC-PC-120", validate: v => /^CC-PC-\d{3}$/.test(v || "") ? "" : "Format: CC-PC-### — Finance rejects free text." },
            { key: "justification", label: "Justification", type: "select", required: true, options: ["Backfill (regretted)", "Backfill (non-regretted)", "Growth — in plan", "Growth — over plan (needs Finance)", "Vendor-to-permanent conversion"] },
            { key: "why", label: "What breaks if this role stays empty for six months?", type: "textarea", required: true, validate: v => (v || "").length < 30 ? "Answer properly — this question is what the CIO reads." : "" },
            { key: "bandMax", label: "Band maximum (k)", type: "number", required: true, validate: (v, all) => { const caps = { L3: 52, L4: 66, L5: 88, L6: 115, M3: 110, E6: 170 }; return all.level && +v > caps[all.level] ? `Above the ${all.level} band cap (${caps[all.level]}k) — needs a comp exception, not a req.` : ""; } }
          ]
        }],
        onSubmit: v => { const id = "REQ-ENG-" + (900 + Math.floor(Math.random() * 99)); Store.create("reqs", { id, title: v.title, level: v.level, site: v.site, costCentre: v.costCentre, squad: "—", justification: v.justification, status: "Pending approval", opened: Clock.today(), bandK: [Math.round(v.bandMax * .75), +v.bandMax], currency: "USD", hmId: "EMP-0003", audit: [{ ts: Clock.today(), actor: Personas.current().name, action: "Requisition raised", comment: v.why }] }); Toast.show(id + " submitted for approval.", "ok"); Router.go("talenthub/req/" + id); }
      }));
    },
    "talenthub/req": (main, args) => {
      const r = Store.get("reqs", args[0]); if (!r) return main.append(C.banner("bad", "Requisition not found."));
      main.append(C.crumbs({ label: "TalentHub", href: "#/talenthub" }, { label: r.id }), C.pageHead(r.title, r.id + " · " + r.site + " · " + r.level, C.pill(r.status)));
      main.append(U.h("div", { class: "grid2" },
        U.h("div", { class: "card" }, U.h("h3", null, "Requisition"), C.kv([["Justification", r.justification], ["Band", EV.bandFmt(r)], ["Cost centre", r.costCentre], ["Squad", r.squad], ["Hiring manager", EV.name(r.hmId)], ["Opened", U.date(r.opened)]]),
          r.status === "Pending approval" ? U.h("div", { style: { marginTop: ".8rem" } }, C.approvalActions("reqs", r.id, { can: true, onApprove: c => Store.save("reqs", r.id, { status: "Approved" }, "Approved", c), onReject: c => Store.save("reqs", r.id, { status: "Rejected" }, "Rejected", c) })) : null),
        U.h("div", { class: "card" }, U.h("h3", null, "Interview loop"),
          U.h("table", { class: "data" }, U.h("thead", null, U.h("tr", null, ["Round", "Tests", "Anchor (5 = great)"].map(h => U.h("th", null, h)))),
            U.h("tbody", null, [["Org-design case", "Restructure a component-team org for a strangler migration", "Designs around domains and handoffs; names who loses what"], ["System design", "Checkout at Black Friday scale", "Arithmetic: TPS, writes, shards, first ceiling"], ["Written exercise", "One-page decision memo", "Decision first, options priced, named cost"], ["Behavioural", "Hard people decisions; bad news upward", "Specific, early, humane, acted on"]].map(x => U.h("tr", null, x.map(c => U.h("td", null, c)))))))));
      main.append(U.h("div", { class: "card", style: { marginTop: "1rem" } }, U.h("h3", null, "Candidates"), C.table({ id: "rc" + r.id, rows: Store.all("candidates").filter(c => c.reqId === r.id), columns: [{ key: "name", label: "Candidate" }, { key: "stage", label: "Stage", render: c => C.pill(c.stage) }, { key: "source", label: "Source" }, { key: "years", label: "Yrs" }], onRow: c => Router.go("talenthub/cand/" + c.id) })));
      main.append(U.h("div", { class: "card", style: { marginTop: "1rem" } }, U.h("h3", null, "Audit trail"), C.auditTrail("reqs", r.id)));
    },
    "talenthub/cand": (main, args) => {
      const c = Store.get("candidates", args[0]); if (!c) return main.append(C.banner("bad", "Candidate not found."));
      const r = Store.get("reqs", c.reqId) || {};
      main.append(C.crumbs({ label: "TalentHub", href: "#/talenthub" }, { label: c.name }), C.pageHead(c.name, (r.title || "") + " · " + c.source, C.pill(c.stage)));
      main.append(C.tabs("cand" + c.id, [
        { id: "cv", label: "Profile", render: () => U.h("div", { class: "card" }, C.kv([["Current", c.currentCo], ["Experience", c.years + " years"], ["Summary", c.summary], ["Source", c.source], ["Days in stage", c.days]]), U.h("p", { class: "muted small", style: { marginTop: ".6rem" } }, "CV: fictional — attachment placeholder 📎")) },
        {
          id: "score", label: "Scorecards", render: () => U.h("div", { class: "card" }, Object.keys(c.scores || {}).length ?
            U.h("div", null, Charts.hbars({ items: Object.entries(c.scores).map(([k, v]) => ({ label: k, value: v, color: v < 3 ? "#c2334d" : "#1f8a5b" })), max: 5, fmt: x => x + "/5" }), U.h("p", { class: "muted small" }, "Bar is 3/5 on every round. Scores are independent — submitted before the debrief, never edited after it.")) :
            U.h("p", { class: "muted" }, "No scorecards yet — loop not run."))
        },
        {
          id: "debrief", label: "Debrief & offer", render: () => {
            const scores = Object.values(c.scores || {});
            const ok = scores.length && Math.min(...scores) >= 3;
            const box = U.h("div", { class: "card" }, U.h("h3", null, "Debrief"), U.h("p", { class: "small" }, "Rules: junior interviewers speak first; evidence against the rubric only; 'culture fit' is not a reason."));
            if (!scores.length) box.append(U.h("p", { class: "muted" }, "Loop not complete."));
            else if (!ok) box.append(C.banner("bad", "Below bar on " + Object.entries(c.scores).filter(([, v]) => v < 3).map(([k]) => k).join(", ") + ". Decision: no hire. Pressure from agencies does not reopen a loop."),
              U.h("button", { class: "btn danger", onclick: () => { Store.save("candidates", c.id, { stage: "Rejected" }, "Rejected after debrief", "Below bar against rubric"); Router.refresh(); } }, "Record no-hire"));
            else {
              const off = Store.state("offer." + c.id) || { base: r.bandK ? r.bandK[0] + Math.round((r.bandK[1] - r.bandK[0]) * .6) : 80 };
              const inBand = r.bandK && off.base >= r.bandK[0] && off.base <= r.bandK[1];
              box.append(U.h("h3", { style: { marginTop: ".8rem" } }, "Offer builder"),
                U.h("div", { class: "field" }, U.h("label", null, "Base (k)"), U.h("input", { type: "number", value: off.base, onchange: e => { off.base = +e.target.value; Store.state("offer." + c.id, off); Router.refresh(); } })),
                inBand ? C.banner("info", "Within band " + EV.bandFmt(r) + ". Approval chain: Head of Engineering → HRBP.") : C.banner("warn", "Outside band " + EV.bandFmt(r) + ". Needs a comp exception: business case + CIO approval."),
                C.approvalActions("candidates", c.id, { label: "offer", can: true, onApprove: cm => Store.save("candidates", c.id, { stage: "Offer" }, "Offer approved at " + off.base + "k", cm), onReject: cm => Store.save("candidates", c.id, { stage: "Rejected" }, "Offer declined internally", cm) }));
            }
            return box;
          }
        },
        { id: "audit", label: "Audit trail", render: () => C.auditTrail("candidates", c.id) }
      ]));
    },
    "talenthub/reports": (main) => {
      main.append(C.crumbs({ label: "TalentHub", href: "#/talenthub" }, { label: "Reports" }), C.pageHead("Hiring reports", "Funnel, time-to-fill and diversity of slate."));
      const cands = Store.all("candidates");
      main.append(U.h("div", { class: "grid2" },
        U.h("div", { class: "card" }, U.h("h3", null, "Funnel"), Charts.hbars({ items: [...TH_STAGES, "Rejected"].map(s => ({ label: s, value: cands.filter(c => c.stage === s).length })) })),
        U.h("div", { class: "card" }, U.h("h3", null, "Diversity of slate by req (top 10)"), Charts.hbars({ items: Object.entries(U.group(cands, "reqId")).slice(0, 10).map(([rid, xs]) => ({ label: rid, value: Math.round(100 * xs.filter(c => c.diverse).length / xs.length) })), max: 100, fmt: v => v + "%" }))));
    }
  }
});

/* ================= PeopleHub ================= */
SITE.modules.push({
  id: "peoplehub", icon: "people", label: "PeopleHub", home: "peoplehub", color: "#2a8c8c", desc: "Org, performance, comp, talent, attrition",
  routes: {
    "peoplehub": (main) => {
      main.append(C.crumbs({ label: "PeopleHub" }), C.pageHead("PeopleHub",
        "Everyone in Platforms & Commerce: profiles, performance cycle, comp review, talent review, engagement and attrition.",
        U.h("a", { class: "btn sec", href: "#/peoplehub/attrition" }, "Attrition dashboard"), U.h("a", { class: "btn sec", href: "#/peoplehub/comp" }, "Comp review"), U.h("a", { class: "btn sec", href: "#/peoplehub/talent" }, "Talent review (9-box)")));
      const eng = EV.eng();
      main.append(U.h("div", { class: "grid4" },
        C.stat("Engineers", eng.length, eng.filter(p => p.perm).length + " permanent · " + eng.filter(p => !p.perm).length + " vendor"),
        C.stat("Sites", "3", CANON.org.sites.map(s => s + " " + eng.filter(p => p.site === s).length).join(" · ")),
        C.stat("Attrition", SEED.attrition.overall + "%", "market " + SEED.attrition.market + "%", "warn"),
        C.stat("Engagement", SEED.engagement.score, "+" + (SEED.engagement.score - SEED.engagement.prev) + " vs last survey", "ok")));
      main.append(C.tabs("ph", [
        {
          id: "dir", label: "Directory", render: () => C.table({
            id: "people", rows: eng, pageSize: 20, columns: [
              { key: "name", label: "Name", render: r => U.h("span", { class: "flex" }, C.avatar(r.name, 22), r.name) },
              { key: "role", label: "Role" }, { key: "level", label: "Level", filter: "select" },
              { key: "squad", label: "Squad", filter: "select" }, { key: "site", label: "Site", filter: "select" },
              { key: "perm", label: "Type", filter: "select", filterVal: r => r.perm ? "Permanent" : "Vendor", render: r => r.perm ? C.pill("Permanent", "blue") : C.pill("Vendor", "teal") },
              { key: "tenure", label: "Tenure", render: r => r.tenure + "y" },
              { key: "managerId", label: "Manager", render: r => EV.name(r.managerId) }],
            onRow: r => SharedScreens.personModal(r)
          })
        },
        {
          id: "cases", label: "Performance cases", render: () => U.h("div", null, Store.all("perfCases").map(pc => U.h("div", { class: "card", style: { marginBottom: "1rem" } },
            U.h("h3", null, pc.type + " — " + EV.name(pc.employeeId), " ", C.pill(pc.status)),
            U.h("p", { class: "small" }, pc.summary),
            U.h("ul", { class: "audit" }, pc.timeline.map(t => U.h("li", null, U.h("span", { class: "when" }, U.date(t[0])), U.h("span", null, t[1])))),
            U.h("p", { class: "small", style: { marginTop: ".5rem" } }, U.h("b", null, "Lesson: "), pc.lesson))))
        },
        {
          id: "pip", label: "PIP tracker", render: () => C.table({ id: "pips", rows: Store.all("pips"), columns: [{ key: "id", label: "PIP" }, { key: "employeeId", label: "Employee", render: r => EV.name(r.employeeId) }, { key: "start", label: "Start", render: r => U.date(r.start) }, { key: "end", label: "End", render: r => U.h("span", { class: "sla " + U.dueClass(r.end, 7) }, U.date(r.end)) }, { key: "status", label: "Status", render: r => C.pill(r.status) }, { key: "checkpoints", label: "Checkpoints", render: r => r.checkpoints.join(" · ") }] })
        },
        {
          id: "cal", label: "Calibration", render: () => {
            const dist = { "Exceeds": 18, "Strong": 34, "Meets": 38, "Partially meets": 8, "Does not meet": 2 };
            return U.h("div", { class: "grid2" },
              U.h("div", { class: "card" }, U.h("h3", null, "Proposed rating distribution (%)"), Charts.bars({ labels: Object.keys(dist), series: [{ label: "% of engineers", points: Object.values(dist) }], fmt: v => v + "%" })),
              U.h("div", { class: "card" }, U.h("h3", null, "Calibration room rules"), U.h("ul", { style: { paddingLeft: "1.1rem", fontSize: ".88rem", lineHeight: 1.6 } }, U.h("li", null, "Evidence first: shipped outcomes, peer feedback, ladder expectations"), U.h("li", null, "No forced curve — but any director above 25% 'Exceeds' explains it"), U.h("li", null, "Promotion packets argued against the public ladder, not tenure"), U.h("li", null, "Brilliant-jerk check: impact on others is part of performance"))));
          }
        },
        {
          id: "promo", label: "Promotions", render: () => U.h("div", { class: "card" }, U.h("h3", null, "Promotion packets (Q4 cycle)"),
            U.h("table", { class: "data" }, U.h("thead", null, U.h("tr", null, ["Engineer", "From → To", "Evidence vs ladder", "Director", "Status"].map(h => U.h("th", null, h)))),
              U.h("tbody", null, EV.eng().filter(p => p.level === "L5" && p.perm).slice(0, 6).map((p, i) => U.h("tr", null, U.h("td", null, p.name), U.h("td", null, "L5 → L6"), U.h("td", { class: "small" }, ["Led Basket cutover; cross-squad design", "Owns payments idempotency standard", "Mentors 4; flaky-test programme lead", "Strong delivery; scope still single-squad", "Incident commander rotation; DR runbooks", "Search relevance architecture"][i]), U.h("td", null, EV.name(Store.get("people", p.managerId)?.managerId)), U.h("td", null, C.pill(["Recommended", "Recommended", "Recommended", "Not yet — scope", "Recommended", "In review"][i])))))))
        },
        {
          id: "survey", label: "Engagement & DevEx", render: () => U.h("div", { class: "grid2" },
            U.h("div", { class: "card" }, U.h("h3", null, "Engagement items (% favourable)"), Charts.hbars({ items: SEED.engagement.items.map(([l, v]) => ({ label: l, value: v, color: v < 60 ? "#c2334d" : "#2a8c8c" })), max: 100, fmt: v => v + "%", padL: 230 })),
            U.h("div", { class: "card" }, U.h("h3", null, "DevEx frictions (1–5, higher = worse)"), Charts.hbars({ items: SEED.devex.topFrictions.map(([l, v]) => ({ label: l, value: v, color: "#f07d1a" })), max: 5, fmt: v => v.toFixed(1) }), U.h("p", { class: "muted small" }, "Full detail and funded actions live in PulseMetrics.")))
        },
        {
          id: "skip", label: "1:1s & skip-levels", render: () => U.h("div", { class: "card" }, U.h("h3", null, "Skip-level & 1:1 tracker"),
            U.h("table", { class: "data" }, U.h("thead", null, U.h("tr", null, ["Person", "Type", "Cadence", "Last", "Themes"].map(h => U.h("th", null, h)))),
              U.h("tbody", null, [["Rohit Kulkarni", "1:1", "Weekly", "2026-10-29", "Loyalty v2 review tone; Atlas date"], ["Maya Lindgren", "1:1", "Weekly", "2026-10-30", "Promotions CFR; search vendor"], ["Carlos Ortiz", "1:1", "Weekly", "2026-10-28", "Fulfilment reset; carrier API"], ["Rhea Desai", "1:1", "Weekly", "2026-10-29", "Identity on-call overload"], ["Daan Visser", "1:1", "Weekly", "2026-10-30", "Black Friday war room"], ["Keisha Brooks", "1:1", "Weekly", "2026-10-27", "CDP adoption"], ["Lena Moreno", "1:1", "Weekly", "2026-10-30", "ARF backlog; standards"], ["Pune L5/L6 group", "Skip-level", "Monthly", "2026-10-15", "Growth paths; legacy work rotation"], ["Rotterdam EMs", "Skip-level", "Monthly", "2026-10-21", "Hiring pace; on-call"]].map(x => U.h("tr", null, U.h("td", null, x[0]), U.h("td", null, x[1]), U.h("td", null, x[2]), U.h("td", null, U.date(x[3])), U.h("td", { class: "small" }, x[4]))))))
        }
      ]));
    },
    "peoplehub/attrition": (main) => {
      const a = SEED.attrition;
      main.append(C.crumbs({ label: "PeopleHub", href: "#/peoplehub" }, { label: "Attrition" }), C.pageHead("Attrition dashboard", "Annualised rolling-12 attrition with cohort cuts and coded exit themes."));
      main.append(U.h("div", { class: "grid4" }, C.stat("Overall", a.overall + "%", "market " + a.market + "%", "bad"), C.stat("Senior (H1 peak)", a.seniorH1 + "%"), C.stat("Senior (now)", a.seniorNow + "%", "after Q3 actions", "ok"), C.stat("Top exit theme", "Growth path", "comp is 4th")));
      main.append(U.h("div", { class: "grid2", style: { marginTop: "1rem" } },
        U.h("div", { class: "card" }, U.h("h3", null, "Annualised attrition (%)"), Charts.line({ labels: SEED.months.map(m => m.slice(2)), series: [{ label: "Overall", points: a.monthly }, { label: "Senior", points: a.seniorMonthly }, { label: "Market", points: SEED.months.map(() => a.market), color: "#9a8da3" }], fmt: v => v + "%" })),
        U.h("div", { class: "card" }, U.h("h3", null, "Coded exit themes (% of exits)"), Charts.hbars({ items: a.themes.map(([l, v], i) => ({ label: (i + 1) + ". " + l, value: v, color: i === 3 ? "#9a8da3" : "#7a2e8e" })), fmt: v => v + "%" }),
          U.h("p", { class: "small" }, "Order matters: growth path > legacy-only work > manager churn > comp. A pay rise alone would have been an expensive non-answer."))));
      main.append(U.h("div", { class: "card", style: { marginTop: "1rem" } }, U.h("h3", null, "Cohort cuts"), Charts.hbars({ items: a.cohorts.map(([l, v]) => ({ label: l, value: v })), fmt: v => v + "%" })));
    },
    "peoplehub/comp": (main) => {
      main.append(C.crumbs({ label: "PeopleHub", href: "#/peoplehub" }, { label: "Comp review" }), C.pageHead("Compensation review", "Bands, compa-ratios, outlier flags and the exception budget ($180k)."));
      const rows = EV.eng().filter(p => p.perm && p.compaRatio);
      const spent = U.sum(Object.values(Store.state("compAdj") || {}), x => x);
      main.append(U.h("div", { class: "grid4" }, C.stat("Exception budget", "$180k"), C.stat("Allocated", U.money(spent * 1000), spent > 180 ? "OVER BUDGET" : "", spent > 180 ? "bad" : "ok"), C.stat("Below 0.88 compa", rows.filter(r => r.compaRatio < 0.88).length, "outliers", "warn"), C.stat("Above 1.12 compa", rows.filter(r => r.compaRatio > 1.12).length)));
      main.append(U.h("div", { style: { marginTop: "1rem" } }, C.table({
        id: "comp", rows, pageSize: 15, defaultSort: "compaRatio", views: [{ label: "Outliers (<0.88)", filter: r => r.compaRatio < 0.88 }, { label: "All permanent" }],
        columns: [{ key: "name", label: "Name" }, { key: "level", label: "Level", filter: "select" }, { key: "squad", label: "Squad" },
        { key: "compaRatio", label: "Compa-ratio", render: r => U.h("span", { class: r.compaRatio < 0.88 ? "down" : r.compaRatio > 1.12 ? "up" : "" }, r.compaRatio.toFixed(2)), sortVal: r => r.compaRatio },
        { key: "flightRisk", label: "Flight risk", filter: "select", render: r => C.pill(r.flightRisk) },
        { key: "adj", label: "Exception ($k)", render: r => U.h("input", { type: "number", style: { width: "80px" }, value: (Store.state("compAdj") || {})[r.id] || "", onchange: e => { const s = Store.state("compAdj") || {}; s[r.id] = +e.target.value || 0; Store.state("compAdj", s); Router.refresh(); } }) }]
      })));
    },
    "peoplehub/talent": (main) => {
      main.append(C.crumbs({ label: "PeopleHub", href: "#/peoplehub" }, { label: "Talent review" }), C.pageHead("Talent review — 9-box & succession", "The output that matters is the succession line for each director and critical platform."));
      const eng = EV.eng().filter(p => p.nineBox);
      const boxes = [["Inconsistent", "High potential", "Star"], ["Low", "Core", "Solid performer"]];
      main.append(U.h("div", { class: "card" }, U.h("h3", null, "9-box distribution (simplified)"),
        Charts.heat({ rows: ["Higher potential", "Lower potential"], cols: ["Lower perf.", "Mid perf.", "Higher perf."], value: (r, c) => { const n = eng.filter(p => p.nineBox === boxes[r][c]).length; return { txt: boxes[r][c] + ": " + n, color: ["#c2334d", "#d97706", "#1f8a5b"][c], title: boxes[r][c] }; } })));
      main.append(U.h("div", { class: "card", style: { marginTop: "1rem" } }, U.h("h3", null, "Succession lines"),
        U.h("table", { class: "data" }, U.h("thead", null, U.h("tr", null, ["Role", "Incumbent", "Ready now", "Ready 1–2 yrs", "Risk"].map(h => U.h("th", null, h)))),
          U.h("tbody", null, Store.all("people").filter(p => p.role.startsWith("Director")).map((p, i) => { const ems = Store.all("people").filter(x => x.managerId === p.id); return U.h("tr", null, U.h("td", null, p.role), U.h("td", null, p.name), U.h("td", null, ems[0] ? ems[0].name : "—"), U.h("td", null, ems[1] ? ems[1].name : "—"), U.h("td", null, C.pill(p.id === "EMP-0022" ? "Resigned — line activated" : i % 3 === 0 ? "Medium" : "Low"))); }),
            [["Payments platform (critical)", "—", "Staff engineer, Payments", "Senior engineer, Payments", "Low (bus factor resolved after PC-02)"], ["Order DB (critical)", "—", "SRE lead", "DBA (vendor→perm)", "High"]].map(x => U.h("tr", null, x.map((c, j) => U.h("td", null, j === 4 ? C.pill(c) : c))))))));
    }
  }
});
