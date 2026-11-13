/* Everline site configuration */
"use strict";
const SITE = {
  ns: "evl.v1",
  brand: { org: "Everline Group", suite: "Everline Hub", mark: "E", tagline: "Platforms & Commerce engineering — people, money, delivery, reliability, risk and the board, in one place." },
  bookName: "The Engineering Head's Handbook",
  respLabel: "of the 56 responsibilities (R1–R56)",
  currency: "USD",
  todaySeed: CANON.todaySeed,
  youId: "you",
  mailName: "EverMail", mailRoute: "mail",
  exampleId: "REQ-ENG-0312",
  announcements: ["Black Friday in " + 25 + " days — freeze begins 20 Nov", "Group cost programme: 15% options due to Dana Thu 5 Nov", "Kestrel (WMS) renewal: +40% ask, meeting 6 Nov"],
  chartColors: ["#7a2e8e", "#f07d1a", "#2a8c8c", "#c2334d", "#4a6fd1", "#1f8a5b", "#9a8da3"],
  personas: [
    { id: "you", personId: "EMP-0003", name: "Asha Rao", role: "Head of Engineering, P&C", permissions: "*" },
    { id: "viktor", personId: "EMP-0002", name: "Viktor Brandt", role: "CIO", permissions: ["exec", "approve-large"] },
    { id: "dana", personId: "EMP-0004", name: "Dana Okoye", role: "CFO partner", permissions: ["finance"] },
    { id: "rohit", personId: "EMP-0020", name: "Rohit Kulkarni", role: "Director, Checkout & Payments", permissions: ["director"] },
    { id: "june", personId: "EMP-0012", name: "June Bakker", role: "HR Business Partner", permissions: ["hr"] },
    { id: "lena", personId: "EMP-0030", name: "Lena Moreno", role: "Principal Engineer", permissions: ["arch"] },
    { id: "camille", personId: "EMP-0006", name: "Camille Laurent", role: "CMO", permissions: ["business"] },
    { id: "ingrid", personId: "EMP-0008", name: "Ingrid Solberg", role: "CISO", permissions: ["security"] },
    { id: "thomas", personId: "EMP-0014", name: "Thomas Ward", role: "Head of Internal Audit", permissions: ["audit-read"] }
  ],
  tone(text) {
    const t = String(text).toLowerCase();
    if (/red|critical|s1|blocker|breach|overloaded|frozen|expired|high|rejected|blocked|disputed|hold/.test(t)) return "red";
    if (/amber|s2|medium|watch|caution|pending|in remediation|in review|canary|trial|assess|open|progress|on hold/.test(t)) return "amber";
    if (/green|s3|s4|low|healthy|closed|done|approved|accepted|live|effective|paid|adopt|normal|complete|hired|recovered/.test(t)) return "green";
    if (/proposed|planned|building|offer/.test(t)) return "purple";
    return "blue";
  },
  searchables: {
    people: { text: r => r.name + " " + r.role + " " + (r.squad || ""), label: r => r.name, sub: r => r.role, link: () => "#/org" },
    reqs: { text: r => r.title + " " + r.site, label: r => r.id + " — " + r.title, sub: r => r.status, link: r => "#/talenthub/req/" + r.id },
    candidates: { text: r => r.name + " " + r.summary, label: r => r.name, sub: r => r.stage, link: r => "#/talenthub/cand/" + r.id },
    vendors: { text: r => r.name + " " + r.service, label: r => r.name, sub: r => r.service, link: r => "#/vendordesk/v/" + r.id },
    programs: { text: r => r.name, label: r => r.name, sub: r => "Program · " + r.rag, link: () => "#/delivery" },
    adrs: { text: r => r.title, label: r => r.id + " — " + r.title, sub: r => r.status, link: () => "#/archhub" },
    incidents: { text: r => r.title, label: r => r.id + " — " + r.title, sub: r => r.sev, link: r => "#/oncall/inc/" + r.id },
    apps: { text: r => r.name + " " + r.domain, label: r => r.name, sub: r => "Tier " + r.tier + " · " + r.domain, link: () => "#/archhub" },
    messages: { text: r => r.subject + " " + r.body, label: r => r.subject, sub: () => "Message", link: r => "#/mail/" + r.id }
  },
  navGroups: [
    { label: "Run the org", items: ["cc", "boardroom"] },
    { label: "People", items: ["talenthub", "peoplehub"] },
    { label: "Money & vendors", items: ["finance", "vendordesk"] },
    { label: "Delivery & engineering", items: ["delivery", "pulsemetrics", "archhub", "releasegate"] },
    { label: "Reliability & risk", items: ["oncall", "slo", "trustdesk", "copilotdesk"] },
    { label: "Special situations", items: ["dealroom", "crisisdesk"] }
  ],
  modules: [],
  eventRules: [
    (from, to) => {
      const out = [];
      const bf = CANON.blackFriday;
      if (from < bf && to >= bf) out.push({ text: Store.state("loadTestPassed") ? "Black Friday ran: checkout held its SLO. The capacity work paid off." : "Black Friday arrived without a signed-off load test — the war room is improvising. (Run the capacity mission next time.)", kind: Store.state("loadTestPassed") ? "ok" : "bad" });
      if (from < "2026-11-05" && to >= "2026-11-05" && !Store.state("cutSubmitted")) out.push({ text: "Dana's deadline passed with no cut options from you. Group finance has applied a 15% pro-rata cut — including permanent headcount.", kind: "bad" });
      if (from < "2026-11-20" && to >= "2026-11-20") out.push({ text: "Change freeze is now in force. Risky changes are blocked until 1 Dec.", kind: "warn" });
      if (from < "2026-11-06" && to >= "2026-11-06") out.push({ text: "Kestrel renewal meeting happened. " + (Store.state("exitPriced") ? "You brought the exit price: the rise came down to 8% with two roadmap commitments." : "Without a priced exit, Kestrel held at +40%."), kind: Store.state("exitPriced") ? "ok" : "bad" });
      if (U.daysBetween(from, to) >= 28) out.push({ text: "Month-end: new actuals in FinancePortal, DORA and SLO burn updated, vendor invoices awaiting approval.", kind: "info" });
      for (const e of Store.all("exceptions")) if (e.expiry > from && e.expiry <= to) out.push({ text: "Exception " + e.id + " expired (" + e.control + "). Exceptions expire — fix it or re-approve with evidence.", kind: "bad" });
      return out;
    }
  ],
  days: [
    {
      title: "Three weeks to Black Friday (scripted day)", intro: "Monday 2 Nov. Black Friday in 25 days, a cut due Thursday, a vendor at +40%, a director about to resign. Prioritise.",
      slots: [
        { t: "08:30", what: "Command Center sweep: SLO burn, open incidents, approvals, budget variance", link: "#/cc", why: "Start from the queue, not the inbox." },
        { t: "09:00", what: "Capacity: confirm the 3× answer for Marcus (first ceiling + dated fix)", link: "#/archhub/capacity", why: "'Probably' is not an answer you can sign." },
        { t: "10:00", what: "INTERRUPT: Carlos resigns (Fulfilment director)", link: "#/mail/MSG-0005", interrupt: true, why: "Succession lines exist for exactly this morning." },
        { t: "11:00", what: "Build the 15% cut options for Dana", link: "#/finance/cuts", why: "Priced options, never a plea." },
        { t: "13:00", what: "Rohit's chat: 'your Loyalty v2 review is a hit job'", link: "#/mail/MSG-0003", interrupt: true, why: "The forum's reputation is a system property you own." },
        { t: "14:00", what: "Kestrel: price the honest exit before Thursday's meeting", link: "#/vendordesk/v/VEN-001", why: "Build the exit before the renewal, not during." },
        { t: "15:30", what: "Freeze planning: classify the 14 risky changes", link: "#/releasegate", why: "Last year's 41 minutes started with a 'standard' config change." },
        { t: "16:30", what: "1:1 prep with Viktor: bad news first", link: "#/boardroom", why: "Amber is rewarded." }
      ]
    },
    {
      title: "Budget Friday (scripted day)", intro: "The 15% ask lands at 9am; options due 5pm. Two interruptions are scripted.",
      slots: [
        { t: "09:00", what: "Read Dana's email; open the cut scenario planner", link: "#/finance/cuts", why: "Shape of the answer: options A/B/C priced." },
        { t: "10:00", what: "Check monthly variances so the arithmetic is believed", link: "#/finance", why: "Variance discipline makes crisis numbers credible." },
        { t: "11:00", what: "INTERRUPT: Black Friday capacity question from the COO", link: "#/mail/MSG-0010", interrupt: true, why: "Peak doesn't pause for budgets." },
        { t: "13:00", what: "Vendor ramp-down: which 30 seats, which squads", link: "#/vendordesk", why: "Option B must be specific to be credible." },
        { t: "14:30", what: "INTERRUPT: journalist query about the supplier breach", link: "#/crisisdesk", interrupt: true, why: "Holding statement inside the cadence." },
        { t: "16:00", what: "Submit options with recommendation C + A + partial B", link: "#/finance/cuts", why: "Protect permanent staff; rebuilding a team costs two years." }
      ]
    }
  ]
};
SITE.hero = {
  who: "Asha Rao — Head of Engineering, Platforms & Commerce",
  brief: "Everline Group: a global retail-and-logistics conglomerate — 1,400 engineers, 120 applications, on-prem plus two clouds. You lead 300 engineers (210 permanent, 90 vendor) across Pune, Rotterdam and Austin through six directors, with a $28.4M budget. You report to Viktor Brandt (CIO). Today is Monday 2 November 2026: Black Friday is 25 days away, Dana needs 15% cut options by Thursday, and the warehouse vendor wants +40%.",
  start: [["Read the urgent mail (Dana, Viktor, Rohit, Carlos)", "#/mail"], ["Open the Command Center", "#/cc"], ["Answer Marcus: can we take 3× traffic?", "#/archhub/capacity"], ["Build the 15% cut options", "#/finance/cuts"], ["Try a mission: negotiate the Kestrel renewal", "#/missions/run/R44"]],
  svg: (() => {
    const cx = 320, cy = 125, R = 92;
    const seg = [["Strategy & architecture", "R1–R12", "#7a2e8e"], ["Org & people", "R13–R20", "#2a8c8c"], ["Delivery", "R21–R27", "#f07d1a"], ["Platform & quality", "R28–R33", "#4a6fd1"], ["Risk & compliance", "R34–R39", "#3b1450"], ["Money & vendors", "R40–R45", "#1f8a5b"], ["Reliability", "R46–R49", "#c2334d"], ["AI · stakeholders", "R50–R56", "#d97706"]];
    let s = '<svg viewBox="0 0 640 250" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="The engineering head operating rhythm" style="width:100%;height:auto;font-family:var(--font-ui)">';
    seg.forEach(([t, r, c], i) => {
      const a0 = -Math.PI / 2 + i * 2 * Math.PI / seg.length, a1 = a0 + 2 * Math.PI / seg.length - 0.04;
      const p = (a, rr) => [cx + rr * Math.cos(a), cy + rr * Math.sin(a)];
      const [x0, y0] = p(a0, R), [x1, y1] = p(a1, R), [x2, y2] = p(a1, 48), [x3, y3] = p(a0, 48);
      s += `<path d="M${x0} ${y0} A${R} ${R} 0 0 1 ${x1} ${y1} L${x2} ${y2} A48 48 0 0 0 ${x3} ${y3} Z" fill="${c}"/>`;
      const am = (a0 + a1) / 2, [lx, ly] = p(am, R + 16), anchor = Math.cos(am) > 0.2 ? "start" : Math.cos(am) < -0.2 ? "end" : "middle";
      s += `<text x="${lx}" y="${ly}" font-size="10.5" font-weight="700" fill="${c}" text-anchor="${anchor}">${t}</text><text x="${lx}" y="${ly + 11}" font-size="8.5" fill="#6f6478" text-anchor="${anchor}">${r}</text>`;
    });
    s += `<circle cx="${cx}" cy="${cy}" r="44" fill="#fff"/><text x="${cx}" y="${cy - 4}" font-size="12" font-weight="800" fill="#3b1450" text-anchor="middle">Asha</text><text x="${cx}" y="${cy + 10}" font-size="8.5" fill="#6f6478" text-anchor="middle">56 responsibilities</text>`;
    s += '<text x="8" y="244" font-size="9" fill="#6f6478">Weekly 1:1s · monthly ops review & finance review · quarterly QBRs & board · Black Friday 27 Nov</text></svg>';
    return s;
  })()
};
