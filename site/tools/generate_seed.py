#!/usr/bin/env python3
"""Deterministic seed generator for the Everline Engineering Head Workspace.
Run: python3 tools/generate_seed.py (repo root). Emits data/seed.js + data/DICTIONARY.md. Seed 20261102."""
import json, random, os
from datetime import date, timedelta
R = random.Random(20261102)
TODAY = "2026-11-02"
def d(iso, n):
    y, m, dd = map(int, iso.split("-")); return str(date(y, m, dd) + timedelta(days=n))
MONTHS = ["2025-11","2025-12","2026-01","2026-02","2026-03","2026-04","2026-05","2026-06","2026-07","2026-08","2026-09","2026-10"]
QUARTERS = ["Q1 FY26","Q2 FY26","Q3 FY26","Q4 FY26"]

FIRST = ["Asha","Viktor","Dana","Rohit","June","Lena","Arjun","Sven","Maya","Carlos","Ingeborg","Tunde","Rhea","Daan","Keisha","Wen","Pablo","Noa","Ishaan","Femke","Marcus","Leah","Kiran","Bastian","Aaliyah","Joost","Sanjay","Elena","Theo","Priyanka","Ruben","Grace","Vikram","Sanne","Diego","Mina","Aditya","Lotte","Jamal","Zoe","Nikhil","Eva","Omar","Tara","Rahul","Iris","Kevin","Anika","Mohan","Lisa","Yusuf","Nora","Deepak","Fleur","Andre","Meera","Hassan","Julia","Varun","Saskia","Tyler","Pooja","Gijs","Brianna","Rohan","Esther","Malik","Divya","Wouter","Chloe"]
LAST = ["Rao","Lindgren","Okoye","Bakker","Iyer","Moreno","Jansen","Kulkarni","Hughes","Gupta","de Jong","Nguyen","Patil","Visser","Brooks","Desai","Smit","Ramos","Joshi","Meijer","Coleman","Pillai","Mulder","Ward","Banerjee","de Boer","Reed","Shetty","Vos","Foster","Menon","Dekker","Price","Kapoor","Peters","Rivera","Agarwal","Hendriks","Bell","Naidu","van Leeuwen","Long","Kamath","Bos","Hayes","Chopra","Willems","Ortiz","Bhat","Kok"]
def nm(i): return f"{FIRST[i % len(FIRST)]} {LAST[(i*11+5) % len(LAST)]}"
SITES = ["Pune","Rotterdam","Austin"]

# ---------------- People ----------------
people=[]
def P(pid,name,role,mgr,level,site,dept,perm=True,squad=None,tenure=None,line="org",notes=""):
    people.append({"id":pid,"name":name,"role":role,"managerId":mgr,"level":level,"site":site,"dept":dept,"perm":perm,"squad":squad,"tenure":tenure if tenure is not None else R.randint(1,12),"line":line,"notes":notes})
P("EMP-0001","Helena Marsh","Group CEO",None,"E9","Rotterdam","Executive",line="exec")
P("EMP-0002","Viktor Brandt","Chief Information Officer","EMP-0001","E8","Rotterdam","Technology",line="exec",notes="Asha's boss. Wants decisions, not decks.")
P("EMP-0003","Asha Rao","Head of Engineering, Platforms & Commerce","EMP-0002","E7","Pune","Platforms & Commerce",tenure=1,line="org",notes="You. 300 engineers, 6 directors, $28.4M budget.")
P("EMP-0004","Dana Okoye","CFO Partner (Technology)","EMP-0005","E7","Rotterdam","Finance",line="peer",notes="Dana's Ledger.")
P("EMP-0005","Pieter Jansen","Group CFO","EMP-0001","E8","Rotterdam","Finance",line="exec")
P("EMP-0006","Camille Laurent","Chief Marketing Officer","EMP-0001","E8","Rotterdam","Marketing",line="peer")
P("EMP-0007","Marcus Hughes","Chief Operating Officer","EMP-0001","E8","Austin","Operations",line="peer")
P("EMP-0008","Ingrid Solberg","Chief Information Security Officer","EMP-0002","E7","Rotterdam","Security",line="peer")
P("EMP-0009","Kwesi Mensah","Chief Data Officer","EMP-0002","E7","Austin","Data",line="peer")
P("EMP-0010","Laura Meijer","Head of Procurement","EMP-0005","E6","Rotterdam","Procurement",line="peer")
P("EMP-0011","Robert Hale","General Counsel","EMP-0001","E8","Rotterdam","Legal",line="peer")
P("EMP-0012","June Bakker","HR Business Partner","EMP-0013","E6","Rotterdam","HR",line="peer",notes="Partners with Asha on every people action.")
P("EMP-0013","Sofia Ramos","Chief People Officer","EMP-0001","E8","Rotterdam","HR",line="exec")
P("EMP-0014","Thomas Ward","Head of Internal Audit","EMP-0001","E7","Rotterdam","Audit",line="peer")
P("EMP-0015","Nadia Petrov","Head of Engineering, Logistics Core","EMP-0002","E7","Rotterdam","Logistics Core",line="peer")
P("EMP-0016","Ben Carter","Head of Enterprise IT","EMP-0002","E7","Austin","Enterprise IT",line="peer")
DIRS=[("EMP-0020","Rohit Kulkarni","Director, Checkout & Payments","Pune","Checkout & Payments","Sceptical senior director; wanted Asha's job. 'Rohit objects.'"),
      ("EMP-0021","Maya Lindgren","Director, Catalog & Promotions","Rotterdam","Catalog & Promotions",""),
      ("EMP-0022","Carlos Ortiz","Director, Fulfilment & Logistics Integration","Austin","Fulfilment",""),
      ("EMP-0023","Rhea Desai","Director, Identity & Platform Engineering","Pune","Identity & Platform",""),
      ("EMP-0024","Daan Visser","Director, Quality & SRE","Rotterdam","Quality & SRE",""),
      ("EMP-0025","Keisha Brooks","Director, Data & Personalisation","Austin","Data & Personalisation","")]
for pid,name,role,site,dept,notes in DIRS: P(pid,name,role,"EMP-0003","E6",site,dept,notes=notes,tenure=R.randint(3,11))
P("EMP-0030","Lena Moreno","Principal Engineer","EMP-0003","E6","Rotterdam","Office of the Head",notes="'Lena's marker' — draws the architecture at every review.")
SQUADS={"EMP-0020":["Checkout","Payments","Basket"],"EMP-0021":["Catalog","Promotions","Search"],"EMP-0022":["Fulfilment","Returns","Carrier Integrations"],"EMP-0023":["Identity","Platform","Developer Experience"],"EMP-0024":["SRE","Quality Engineering","Release Engineering"],"EMP-0025":["Personalisation","Data Platform","Loyalty"]}
squad_list=[]
idx=40
for dir_id,sqs in SQUADS.items():
    dsite=next(p["site"] for p in people if p["id"]==dir_id)
    for s in sqs:
        squad_list.append({"id":"SQ-"+s.replace(" ","").replace("&",""),"name":s,"directorId":dir_id})
        em=f"EMP-{idx:04d}"; idx+=1
        esite=R.choice(SITES)
        P(em,nm(idx),f"Engineering Manager, {s}",dir_id,"M3",esite,s,squad=s)
        # ~16 engineers per squad -> 18 squads*16=288 + 18 EMs + dirs ≈ 300+
        for k in range(15):
            perm = not (k % 3 == 0)  # exactly 5 vendor seats per squad -> 90 vendor
            lvl = R.choice(["L3","L3","L4","L4","L4","L5","L5","L6"])
            role = {"L3":"Software Engineer","L4":"Software Engineer II","L5":"Senior Software Engineer","L6":"Staff Engineer"}[lvl]
            if k==14: role="QA Engineer"; lvl="L4"
            P(f"EMP-{idx:04d}",nm(idx), role+("" if perm else " (vendor)"), em, lvl, esite if R.random()<0.75 else R.choice(SITES), s, perm=perm, squad=s)
            idx+=1
for k in range(5):
    P(f"EMP-{idx:04d}",nm(idx),"Staff Engineer","EMP-0030","L6",SITES[k%3],"Office of the Head",squad=None); idx+=1
# enrich
for p in people:
    if p["dept"] not in ("Executive","Finance","Marketing","Operations","Security","Data","Procurement","Legal","HR","Audit","Logistics Core","Enterprise IT"):
        p["compaRatio"]=round(R.uniform(0.82,1.18),2) if p["perm"] else None
        p["nineBox"]=R.choice(["Core","Core","Core","High potential","Solid performer","Star","Inconsistent","Low"]) if p["perm"] else None
        p["flightRisk"]=R.choice(["Low","Low","Medium","High"])
        p["skills"]=R.sample(["Java","Kotlin","Go","TypeScript","React","Kubernetes","Kafka","PostgreSQL","AWS","Azure","Terraform","SRE","Testing","Security","ML"],3)
eng=[p for p in people if p.get("squad") or p["role"].startswith("Director") or p["dept"]=="Office of the Head"]
n_perm=sum(1 for p in eng if p["perm"]); n_vend=sum(1 for p in eng if not p["perm"])

# Performance cases (canon)
perfCases=[
 {"id":"PC-01","type":"Quiet decline","employeeId":"EMP-0047","summary":"Once-solid senior engineer; shipped little for two quarters.","status":"Recovered — support plan closed","timeline":[["2026-03-04","Data gathered: commits, reviews, peer feedback — the work may be the issue"],["2026-03-11","Direct conversation: specific observations, 'what's changed?' — sick parent, dead-end project"],["2026-03-18","Support plan: project move + flexible hours, fortnightly checkpoints"],["2026-06-20","Checkpoint 6: back to bar; plan closed"]],"lesson":"Early enough to be about help, not termination."},
 {"id":"PC-02","type":"Brilliant jerk","employeeId":"EMP-0049","summary":"Best payments engineer; juniors leave his reviews in tears. Two resignations cite him.","status":"Exited with dignity","timeline":[["2026-02-02","Behaviour named with instances; impact stated as business cost (2 resignations)"],["2026-02-02","Standard made non-negotiable; coaching offered once"],["2026-05-15","Improved for a quarter, then relapsed"],["2026-06-12","Exit with dignity and a good reference; 3 engineers stepped up within weeks"]],"lesson":"The feared bus factor never materialises; velocity rises."},
 {"id":"PC-03","type":"PIP","employeeId":"EMP-0061","summary":"Mid-level hire six months behind the bar despite coaching.","status":"Exited — clean and unsurprising","timeline":[["2026-04-01","Decision made before issue: will act on the result either way"],["2026-04-06","PIP issued: specific gaps, support named, 4 weeks, outcomes defined both directions"],["2026-05-04","Did not clear the PIP"],["2026-05-08","Respectful exit, unsurprising to anyone including him"]],"lesson":"A PIP you don't intend to honour is cruelty with paperwork."}]
pips=[{"id":"PIP-0003","employeeId":"EMP-0061","start":"2026-04-06","end":"2026-05-04","status":"Closed — not met","checkpoints":["Week 1 ✓","Week 2 partial","Week 3 ✗","Week 4 ✗"]},{"id":"PIP-0007","employeeId":"EMP-0144","start":"2026-10-19","end":"2026-11-16","status":"Active","checkpoints":["Week 1 ✓","Week 2 ✓","Week 3 pending","Week 4 pending"]}]

# ---------------- Hiring ----------------
reqs=[]; cands=[]
roles=[("Director, Data & Personalisation backfill","E6","Austin"),("Principal Engineer, Platform","E6","Pune"),("Senior Software Engineer","L5","Pune"),("Software Engineer II","L4","Rotterdam"),("Staff Engineer, Payments","L6","Pune"),("SRE","L5","Austin"),("Engineering Manager, Identity","M3","Pune"),("QA Engineer","L4","Pune"),("Senior Frontend Engineer","L5","Rotterdam"),("Data Engineer","L5","Austin")]
stages=["Applied","Recruiter screen","Hiring manager","Onsite loop","Debrief","Offer","Hired","Rejected"]
for i in range(40):
    r,lvl,site=roles[i%len(roles)]
    status=R.choice(["Open","Open","Open","Approved","Pending approval","On hold"]) if i>2 else "Open"
    rid=f"REQ-ENG-{300+i:04d}"
    band={"L3":(38,52),"L4":(48,66),"L5":(62,88),"L6":(85,115),"M3":(80,110),"E6":(120,170)}[lvl]
    reqs.append({"id":rid,"title":r,"level":lvl,"site":site,"costCentre":f"CC-PC-{R.randint(100,160)}","squad":R.choice([s["name"] for s in squad_list]),
      "justification":R.choice(["Backfill for regretted attrition","Atlas strangler capacity (Checkout domain)","Black Friday reliability (SRE depth)","Vendor-to-permanent conversion (cost-neutral)","Platform golden-path roadmap"]),
      "status":status,"opened":d(TODAY,-R.randint(5,160)),"bandK":band,"currency":"USD" if site=="Austin" else ("EUR" if site=="Rotterdam" else "INR"),"hmId":R.choice([p["id"] for p in people if p["role"].startswith("Engineering Manager")]),"audit":[]})
for i in range(250):
    rq=R.choice(reqs[:30])
    st=R.choices(stages,weights=[30,20,15,12,5,4,4,25])[0]
    cid=f"CAND-{i+1:04d}"
    src=R.choice(["Referral","Agency: TalentBridge Partners","Agency: Northstar Search","Careers site","Sourced (LinkedIn-style)","Campus"])
    cands.append({"id":cid,"name":nm(200+i),"reqId":rq["id"],"stage":st,"source":src,"years":R.randint(2,18),
      "currentCo":R.choice(["Retailer (fictional) — Larkfield Stores","Logistics scale-up — Parcelwise","Bank — Meridian Trust","Marketplace — Bazaarly","Consultancy — Corvane","SaaS — Fernhill Cloud"]),
      "summary":R.choice(["Led checkout re-platform; strong on payments idempotency.","Built SRE practice from zero; error-budget policy author.","Frontend performance specialist; Core Web Vitals.","Event-driven systems at 10k TPS; Kafka operations.","Org design case strong; managed 4 squads across 2 sites."]),
      "scores":({"Org-design case":R.randint(2,4),"System design":R.randint(2,4),"Written exercise":R.randint(2,4),"Behavioural":R.randint(2,4)} if st in ("Onsite loop","Debrief","Offer","Hired") else {}),
      "diverse": R.random()<0.38,"days":R.randint(3,70),"audit":[]})
# canon: recruiter pushing weak candidate
cands[0].update({"name":"Gavin Holt","stage":"Debrief","source":"Agency: TalentBridge Partners","scores":{"Org-design case":2,"System design":2,"Written exercise":1,"Behavioural":3},"summary":"Agency's 'perfect fit'. Panel: no-hire twice on system design.","reqId":"REQ-ENG-0300"})

# ---------------- Vendors ----------------
vendors=[]
vdef=[("Kestrel Systems","Warehouse-management system (WMS)","Critical",2.6e6,0,"2027-01-31","Raising renewal 40%; 11 years embedded. Honest exit priced at $3.1M / 14 months."),
 ("Brightpath Talent","Staff augmentation (Pune)","High",3.1e6,52,"2027-03-31",""),("Coralline Digital","Staff augmentation (Rotterdam/Austin)","High",1.9e6,26,"2027-06-30",""),
 ("Nimbus Cloud (account team)","Primary cloud provider","Critical",3.0e6,0,"2027-09-30","Commitments renewal Q1."),("Tessera CDP","Customer data platform","High",0.9e6,0,"2027-02-28","Adoption below plan."),
 ("Arcwave Payments","Payment gateway","Critical",1.2e6,0,"2028-03-31",""),("Quillcheck","Test automation tooling","Medium",0.3e6,0,"2026-12-31",""),
 ("Signalfire Observability","Observability platform","High",0.7e6,0,"2027-05-31",""),("Lumenpath Search","Search SaaS","Medium",0.4e6,0,"2027-04-30",""),
 ("Harbourline Carriers API","Carrier integration hub","High",0.5e6,0,"2027-08-31",""),("Veridian Security","Pen-testing & red team","Medium",0.25e6,0,"2027-01-15",""),
 ("Pinemark Consulting","Architecture consulting","Low",0.35e6,6,"2026-12-15",""),("Datastrand","Data labelling & QA","Low",0.15e6,6,"2027-03-31",""),("Orbitbyte AI","Code assistant licences","Medium",0.4e6,0,"2027-06-30","")]
for i,(n,svc,tier,spend,seats,ren,note) in enumerate(vdef):
    vendors.append({"id":f"VEN-{i+1:03d}","name":n,"service":svc,"tier":tier,"annualSpend":spend,"seats":seats,"renewal":ren,"notes":note,
      "rateCard":({"L3":28,"L4":36,"L5":48,"L6":62} if seats else None),
      "clauses":{"Exit & transition":i not in (0,4),"Breach notification (72h)":i not in (3,8),"SLA credits":True,"Audit rights":i not in (6,12),"Data return/deletion":i!=4},
      "sla":round(R.uniform(97.5,99.95),2),"attritionVendorSide":(round(R.uniform(8,26),1) if seats else None),
      "scorecard":{"Delivery":R.randint(2,5),"Quality":R.randint(2,5),"Responsiveness":R.randint(3,5),"Commercials":R.randint(2,5),"Roadmap kept":R.randint(2,5)},"audit":[]})
sows=[{"id":f"SOW-{i+1:03d}","vendorId":v["id"],"title":f"{v['service']} — FY26 SOW","value":v["annualSpend"],"start":"2026-01-01","end":v["renewal"],"status":"Active"} for i,v in enumerate(vendors)]
invoices=[]
for m in MONTHS[-6:]:
    for v in vendors[:6]:
        amt=round(v["annualSpend"]/12*R.uniform(0.92,1.12),-2)
        invoices.append({"id":f"INV-{m.replace('-','')}-{v['id'][-3:]}","vendorId":v["id"],"month":m,"amount":amt,"status":"Paid" if m<"2026-10" else R.choice(["Pending approval","Pending approval","Disputed"]),"variance":round(100*(amt/(v["annualSpend"]/12)-1),1),"audit":[]})
qbrs=[{"id":"QBR-2026Q3-001","vendorId":"VEN-002","quarter":"Q3 2026","slaHit":"97.8% (target 98%)","promisesKept":"3 of 5","incidents":2,"vendorAttrition":"22% (contract cap 15%)","score":3.1,"actions":["Attrition remediation plan within 30 days","Named-resource continuity clause at renewal","Shadowing ratio 1:3 for new joiners"]},
      {"id":"QBR-2026Q3-002","vendorId":"VEN-001","quarter":"Q3 2026","slaHit":"99.1%","promisesKept":"1 of 4","incidents":3,"vendorAttrition":"n/a","score":2.6,"actions":["Roadmap commitments in writing before renewal","Integration-layer exit plan costed (R44)"]}]
rfp={"id":"RFP-2026-04","title":"Order orchestration & WMS integration layer","weights":{"Functional fit":25,"Exit & portability":20,"TCO (5y)":20,"Security":15,"Delivery track record":10,"Roadmap":10},"lockedOn":"2026-09-01","vendors":[{"name":"Kestrel Systems (incumbent)","scores":{"Functional fit":4,"Exit & portability":1,"TCO (5y)":2,"Security":4,"Delivery track record":3,"Roadmap":2}},{"name":"Oakridge Commerce","scores":{"Functional fit":4,"Exit & portability":4,"TCO (5y)":3,"Security":4,"Delivery track record":3,"Roadmap":4}},{"name":"Build on golden path (in-house)","scores":{"Functional fit":3,"Exit & portability":5,"TCO (5y)":3,"Security":4,"Delivery track record":3,"Roadmap":4}}],"pilot":"Oakridge 6-week pilot: 2 warehouses, order latency p95 210ms, 0 sev incidents."}

# ---------------- Budget (canonical $28.4M, RTB 69%) ----------------
lines=[("Permanent staff (210 FTE)",11.2e6,2.8e6),("Vendor/contract staff (90)",3.2e6,2.1e6),("Cloud & infrastructure",2.9e6,0.4e6),("Software licences & tools",1.3e6,0.2e6),("Platform programmes",0,1.6e6),("Modernization (Atlas strangler)",0,1.4e6),("Security & compliance",0.6e6,0.3e6),("Training & travel",0.3e6,0.1e6)]
budget={"total":28.4e6,"rtbPct":69,"lines":[{"line":l,"rtb":a,"ctb":b} for l,a,b in lines],
  "cutOptions":[{"id":"A","label":"Pause bottom-quartile CTB programmes","saves":2.4e6,"consequence":"Two launches slip two quarters","risk":"Medium"},
                {"id":"B","label":"Vendor ramp-down (30 seats)","saves":1.4e6,"consequence":"Delivery capacity −11%","risk":"Medium"},
                {"id":"C","label":"Cloud rightsize + licence rationalisation","saves":0.9e6,"consequence":"One-off effort; low risk","risk":"Low"}],
  "cutTarget":4.26e6,"recommended":"C + A + partial B → $4.3M; permanent-staff layoffs avoided",
  "unitCost":[round(0.142-(0.142-0.118)*i/11,3) for i in range(12)],
  "untaggedPct":[14,13,13,12,11,9,8,7,6,5,4,4],
  "actuals":[]}
causes={"2026-01":"Holiday-peak cloud overrun (autoscaling floor left high)","2026-03":"Vendor seats ramped early for Atlas","2026-06":"Licence true-up: observability","2026-08":"Hiring slip — 6 reqs late (underspend)","2026-09":"Black Friday load-test environments"}
for i,m in enumerate(MONTHS):
    plan=28.4e6/12
    var=R.uniform(-0.03,0.03)
    if m in causes: var = R.choice([0.07,0.08,-0.06]) if m!="2026-08" else -0.07
    budget["actuals"].append({"month":m,"plan":round(plan),"actual":round(plan*(1+var)),"cause":causes.get(m,"")})
purchaseReqs=[{"id":f"PR-{i+1:04d}","title":t,"amount":a,"requesterId":rq,"limit":lim,"status":st,"capex":cx,"audit":[]} for i,(t,a,rq,lim,st,cx) in enumerate([
 ("Load-test tooling licences (Black Friday)",48000,"EMP-0024","Director ≤ $50k","Pending approval",False),
 ("Additional DB read replicas (checkout)",120000,"EMP-0020","Head ≤ $250k","Pending approval",False),
 ("Pen-test: payments re-platform",85000,"EMP-0023","Head ≤ $250k","Approved",False),
 ("Developer laptops refresh (40)",96000,"EMP-0023","Head ≤ $250k","Pending approval",True),
 ("Kestrel integration exit study",140000,"EMP-0022","Head ≤ $250k","Pending approval",False),
 ("Observability seats expansion",310000,"EMP-0024","CIO > $250k","Escalated to CIO",False)])]
showback=[{"line":bl,"cloud":round(R.uniform(0.2,1.1)*1e6),"orders":R.randint(40,260)*1e6} for bl in ["Online retail","Marketplace","Stores (click & collect)","Wholesale","Logistics services"]]

# ---------------- Programs, OKRs, commitments ----------------
programs=[]
pdef=[("PRG-01","Atlas (order-management strangler)","EMP-0020","Amber","Catalog cutover CDC lag in peak tests",4.2e6,0.61,0.58),
 ("PRG-02","Fulfilment 2.0","EMP-0022","Red","Dependency on Logistics Core carrier API 'two weeks away' for 9 months",3.1e6,0.82,0.30),
 ("PRG-03","Black Friday readiness 2026","EMP-0024","Amber","DB shard ceiling at 2.2× before split",1.1e6,0.70,0.66),
 ("PRG-04","Golden-path platform","EMP-0023","Green","Adoption by Fulfilment squads",1.6e6,0.55,0.57),
 ("PRG-05","Identity consolidation (SSO)","EMP-0023","Amber","On-call overload in Identity squad",0.9e6,0.64,0.55),
 ("PRG-06","Personalisation v3","EMP-0025","Green","CDP adoption",1.2e6,0.48,0.50),
 ("PRG-07","Loyalty v2","EMP-0025","Amber","Design review findings (2 blockers)",0.8e6,0.20,0.15),
 ("PRG-08","Payments re-platform","EMP-0020","Green","PSP certification window",1.5e6,0.72,0.74),
 ("PRG-09","Catalog search relevance","EMP-0021","Green","Vendor contract renewal",0.6e6,0.40,0.42)]
for pid,name,own,rag,risk,bud,burn,prog in pdef:
    programs.append({"id":pid,"name":name,"ownerId":own,"rag":rag,"ownerConfidence":rag,"topRisk":risk,"budget":bud,"burnPct":burn,"progressPct":prog,"audit":[],
      "raid":[{"type":"Risk","text":risk,"owner":own},{"type":"Assumption","text":"Shared platform capacity available per quarterly plan","owner":"EMP-0023"},{"type":"Issue","text":"Environment contention in staging","owner":"EMP-0024"},{"type":"Dependency","text":"Logistics Core API" if pid=="PRG-02" else "Platform golden path v2","owner":"EMP-0015" if pid=="PRG-02" else "EMP-0023"}]})
fulfilmentReset=[("Stop the clock honestly","One week of diagnosis, no new promises; demo of what runs end to end (nothing does — that's the finding).","Done"),
 ("Find the smallest shippable truth","One warehouse, one product line, live in six weeks — chosen for learning, not optics.","Done"),
 ("Reset the contract","Scope cut 40% with the sponsor's hands on the knife; dates as P85s; weekly demo replaces status deck.","Done"),
 ("Fix the one structural cause","Carrier API dependency 'two weeks away' for 9 months — escalated into Asha's portfolio with a named owner.","In progress"),
 ("Restaff morale","Two energising additions beat ten warm bodies — Brooks's law is real.","Planned")]
okrs=[{"id":"OKR-ORG-1","level":"Org","objective":"Black Friday with zero Sev1 and checkout SLO met","krs":[["Checkout availability ≥ 99.9% (43-min monthly budget) through peak",0.7],["Load test at 3× forecast passes by 13 Nov",0.6],["Sev1 count on peak weekend = 0",None]]},
 {"id":"OKR-ORG-2","level":"Org","objective":"Make delivery a management system","krs":[["Lead time ≤ 3.5 days org average",0.9],["CFR ≤ 12% with no team above 15%",0.7],["PR wait p90 from 29h to ≤ 12h",0.4]]},
 {"id":"OKR-ORG-3","level":"Org","objective":"Reverse regrettable attrition","krs":[["Senior attrition ≤ 14% annualised",0.8],["Every senior engineer has a growth path doc",0.6],["Legacy-only teams rotate onto modernisation work",0.5]]},
 {"id":"OKR-ORG-4","level":"Org","objective":"Unit cost per order down 15%","krs":[["$0.142 → $0.118",0.95],["Untagged spend < 5%",0.9],["Showback live for all business lines",1.0]]}]
for s in squad_list:
    okrs.append({"id":"OKR-"+s["id"],"level":"Squad: "+s["name"],"objective":R.choice(["Ship the domain's Atlas cutover","Cut p99 latency 20%","Halve flaky tests","Raise deploy frequency to daily","Reduce pages/week below 5"]),"krs":[["Key result 1",round(R.uniform(0.2,1),1)],["Key result 2",round(R.uniform(0.1,0.9),1)]]})
plan={"quarter":"Q1 FY27","capacityPct":70,"items":[]}
for i,t in enumerate(["Atlas: Catalog cutover","Payments: PSP v3 cert","Golden path v2","Checkout p99 −20%","Loyalty v2 (re-designed)","Identity SSO wave 2","Search relevance v4","Fulfilment: warehouse 2-3","Flaky test burn-down","Personalisation experiments","Returns self-service","Carrier API v2 adoption","Promotions engine refactor","Data contracts rollout","CDP integration phase 2","Mobile web perf budget"]):
    plan["items"].append({"rank":i+1,"title":t,"points":R.randint(8,30),"aboveLine":i<10})
commitments=[{"id":f"COM-{i+1:03d}","what":w,"p85":p85,"p50":p50,"askedBy":ab,"changeLog":cl} for i,(w,p85,p50,ab,cl) in enumerate([
 ("Campaign landing pages for 'Winter Edit'","2026-11-20","2026-11-13","CMO",[["2026-10-12","CMO pull-in from 27 Nov to 20 Nov: priced yes — Promotions refactor slipped 3 weeks (visible trade)"]]),
 ("Catalog domain cutover (Atlas)","2027-02-26","2027-02-05","CIO",[["2026-09-30","Re-dated after CDC lag finding; trade: freeze window honoured"]]),
 ("Fulfilment warehouse #1 live","2026-10-23","2026-10-16","COO",[["2026-09-01","Reset contract: scope −40%"]]),
 ("Payment gateway v3 live","2026-12-11","2026-12-04","CFO",[]),
 ("Identity SSO wave 2","2027-01-29","2027-01-15","CISO",[["2026-10-05","On-call relief work prioritised first (trade agreed with CISO)"]])])]
atlas=[{"domain":d1,"status":st,"traffic":tr,"cdc":cdc,"reversible":rv,"monolithRetired":mr,"cutover":co} for d1,st,tr,cdc,rv,mr,co in [
 ("Checkout","Live",100,"Retired",True,True,"2026-04-14"),("Basket","Live",100,"Retired",True,True,"2026-06-09"),
 ("Catalog","Canary",20,"Active",True,False,"2027-02-26"),("Promotions","Building",0,"Planned",True,False,"2027-Q2"),
 ("Customer accounts","Planned",0,"—",True,False,"2027-Q3"),("Order history","Planned",0,"—",True,False,"2027-Q4")]]

# ---------------- Metrics ----------------
DORA={"Q1 FY26":(1.96,8.85,22,12.04),"Q2 FY26":(2.56,6.29,15,10.1),"Q3 FY26":(3.2,5.28,10,7.15),"Q4 FY26":(3.41,3.2,12,6.7)}
dora=[]
six=["Checkout","Payments","Catalog","Promotions","Identity","Fulfilment"]
for q,(dep,lt,cfr,mttr) in DORA.items():
    dora.append({"squad":"Org average","quarter":q,"deploysPerWeek":dep,"leadDays":lt,"cfr":cfr,"mttrH":mttr})
    for s in six:
        f=R.uniform(0.75,1.25)
        c = 15 if (s=="Promotions" and q=="Q4 FY26") else max(5,round(cfr*R.uniform(0.7,1.2)))
        dora.append({"squad":s,"quarter":q,"deploysPerWeek":round(dep*f,2),"leadDays":round(lt/f,2),"cfr":c,"mttrH":round(mttr*R.uniform(0.7,1.3),1)})
devex={"topFrictions":[["Flaky tests",3.9],["Slow CI builds",3.6],["Environment contention",3.4],["Unclear ownership",3.1],["Review wait time",3.0],["Docs out of date",2.8]],"firstCommitDays":3.5,"prWaitP50h":7,"prWaitP90h":29,"responses":241,"actions":[["Quarantine + fix-it rotation for flaky tests","Funded — 2 engineers, Q4","EMP-0024"],["Build cache + parallel test shards","Funded — Platform roadmap","EMP-0023"],["Ephemeral environments pilot","Funded — Q1","EMP-0023"],["Review SLA: first review < 4h in core hours","Policy live","EMP-0030"]]}
flow={"wip":[R.randint(18,40) for _ in range(12)],"blockedAgeDays":[round(R.uniform(2,7),1) for _ in range(12)],"escapeRate":[round(R.uniform(3,9),1) for _ in range(12)],"buildMinP50":[round(14-i*0.6,1) for i in range(12)]}
aiMetrics=[{"tier":"Tier A — AI-generated, human-reviewed","share":31,"cfr":11,"reviewTimeH":5.2},{"tier":"Tier B — AI-assisted (suggestions accepted)","share":42,"cfr":10,"reviewTimeH":6.1},{"tier":"Tier C — Human-authored","share":27,"cfr":12,"reviewTimeH":7.4}]
aiTools=[{"tool":"Orbitbyte AI code assistant","tier":"Approved","boundary":"Source code (non-secret); no customer data","adoption":78},{"tool":"Internal chat (gateway-routed LLM)","tier":"Approved","boundary":"Internal docs; no PII","adoption":64},{"tool":"Test-generation agent","tier":"Pilot","boundary":"Test code only; PR-gated","adoption":22},{"tool":"PR review agent","tier":"Pilot","boundary":"Diff only; advisory comments","adoption":35},{"tool":"Consumer chatbots","tier":"Blocked","boundary":"None — proxy-blocked","adoption":0}]

# ---------------- Architecture ----------------
adrs=[]
adr_titles=["Adopt strangler pattern for Atlas","Kafka as the event backbone","PostgreSQL as default OLTP store","Service mesh: defer","Golden-path service template v1","Idempotency keys on all payment POSTs","Feature flags vendor vs build: buy","GraphQL for storefront BFF only","No new languages this cycle","Data contracts for domain events","Multi-region active-passive for checkout","Rate limiting at the edge","Secrets in vault, never env files","Observability: OpenTelemetry standard","Retire custom ORM","Async inventory reservation","Search: buy managed","API versioning: URL major + sunset headers","Error-budget policy enforcement","Ephemeral environments","Loyalty points ledger: event-sourced","CDN for product images","Contract testing for partner APIs","Pune-Rotterdam follow-the-sun on-call","Shard orders DB by customer hash (4 shards)","Monorepo for web; polyrepo for services","Mobile web perf budget","Deprecate SOAP partner endpoints","AI code assistant: approved tiers","DR: warm standby for tier-1 services"]
for i,t in enumerate(adr_titles):
    adrs.append({"id":f"ADR-{i+1:04d}","title":t,"status":R.choice(["Accepted","Accepted","Accepted","Superseded","Proposed"]) if i<28 else "Proposed","date":d("2025-12-01",i*11),"ownerId":R.choice([x[0] for x in DIRS]+["EMP-0030"]),"context":"Context, options considered, decision and consequences recorded per template.","audit":[]})
archReviews=[{"id":"ARF-2026-031","title":"Everline Loyalty v2 — design","squad":"Loyalty","submitted":"2026-10-28","status":"In review","reviewerId":"EMP-0030",
  "findings":[{"risk":"Shared database between Points and Rewards services","consequence":"Coupling disguised as convenience; schema change in one breaks the other; no independent deploys","severity":"Blocker","rec":"Split ownership; Rewards consumes Points events"},
              {"risk":"'Scale horizontally' with session state held in memory","consequence":"Sticky sessions or lost state on scale-out/failover","severity":"Blocker","rec":"Externalise session state (Redis) or make handlers stateless"},
              {"risk":"Retries on non-idempotent POST /points","consequence":"Duplicate points on every timeout — a financial liability","severity":"Advisory → treat as must-fix","rec":"Idempotency keys (per ADR-0006)"},
              {"risk":"No deprecation path for v1 API used by partners","consequence":"Partner breakage at cutover; contractual exposure","severity":"Advisory","rec":"Sunset headers + 2-quarter overlap per ADR-0018"},
              {"risk":"'Redis will handle it' — no capacity arithmetic","consequence":"Unknown ceiling at Black Friday volumes","severity":"Advisory","rec":"Capacity model with peak TPS and memory per key"}],"audit":[]},
 {"id":"ARF-2026-030","title":"Returns self-service — async refunds","squad":"Returns","submitted":"2026-10-14","status":"Approved with conditions","reviewerId":"EMP-0030","findings":[],"audit":[]},
 {"id":"ARF-2026-029","title":"Catalog CDC pipeline for Atlas cutover","squad":"Catalog","submitted":"2026-10-02","status":"Approved","reviewerId":"EMP-0030","findings":[],"audit":[]}]
radar=[{"name":n,"ring":r,"quadrant":q} for n,r,q in [("Kubernetes","Adopt","Platforms"),("Kafka","Adopt","Platforms"),("PostgreSQL","Adopt","Platforms"),("OpenTelemetry","Adopt","Tools"),("Feature flags","Adopt","Techniques"),("Strangler fig migrations","Adopt","Techniques"),("Contract testing","Trial","Techniques"),("Ephemeral environments","Trial","Platforms"),("AI code assistants (tiered)","Trial","Tools"),("Data contracts","Trial","Techniques"),("Service mesh","Assess","Platforms"),("WebAssembly at edge","Assess","Languages"),("LLM test generation","Assess","Tools"),("Custom ORM","Hold","Languages"),("SOAP partner APIs","Hold","Techniques"),("Big-bang rewrites","Hold","Techniques"),("Shared databases across services","Hold","Techniques"),("New languages","Hold","Languages")]]
apps=[]
domains=["Checkout","Payments","Basket","Catalog","Promotions","Search","Fulfilment","Returns","Carrier Integrations","Identity","Platform","Personalisation","Data Platform","Loyalty","Store Ops","Finance Integrations","Customer Service","Marketing Tech"]
for i in range(120):
    dom=domains[i%len(domains)]
    tier = 1 if i<18 else (2 if i<60 else 3)
    apps.append({"id":f"APP-{i+1:03d}","name":f"{dom.lower().replace(' ','-')}-{R.choice(['api','svc','web','worker','bff','gateway','batch','ui'])}{'' if i<18 else '-'+str(i)}","domain":dom,"tier":tier,"owner":dom+" squad","slo":{1:"99.9%",2:"99.5%",3:"99.0%"}[tier],"runtime":R.choice(["k8s (cloud A)","k8s (cloud B)","on-prem VM","monolith module","SaaS"]),"lifecycle":R.choice(["Invest","Invest","Maintain","Maintain","Retire"]) if i>5 else "Invest","debtScore":R.randint(1,10)})
debt=[{"id":f"DEBT-{i+1:03d}","item":t,"interest":intr,"principal":pr,"score":round(intr/pr,2) if pr else 0,"owner":o} for i,(t,intr,pr,o) in enumerate([
 ("Order monolith (Atlas remainder)",9,10,"Checkout & Payments"),("Flaky integration test suite",8,4,"Quality & SRE"),("Custom ORM in catalog",6,5,"Catalog & Promotions"),("Manual DB failover runbook",8,3,"Quality & SRE"),
 ("SOAP partner endpoints",5,4,"Fulfilment"),("Shared admin accounts (prod)",9,2,"Identity & Platform"),("Untagged cloud resources",5,2,"Identity & Platform"),("Duplicate customer stores",7,8,"Data & Personalisation"),
 ("Hand-rolled feature flags",4,3,"Identity & Platform"),("Unowned cron jobs (37)",6,3,"Quality & SRE"),("Legacy promotions rule engine",7,7,"Catalog & Promotions"),("Eleven pipeline variants",7,5,"Identity & Platform")])]
capacity={"ordersPerDay":26e6,"peakMultiplier":8,"peakTps":2407,"dbWritesPerSec":7222,"shards":4,"pods":27,"writesPerOrder":3,"podTps":100,"shardCeilingX":2.2}

# ---------------- Changes, incidents, SLOs ----------------
changes=[]
for i in range(80):
    dt=d(TODAY,R.randint(-40,25))
    risky=R.random()<0.22
    changes.append({"id":f"CHG-{1100+i}","title":R.choice(["Checkout config","Payments SDK bump","Catalog index rebuild","Promotions rule deploy","Identity token TTL","DB connection-pool tuning","CDN rule change","Feature flag rollout","Schema migration","Kafka partition increase"])+f" #{i}","class":"Risky (CAB)" if risky else "Standard (pipeline-approved)","date":dt,"status":"Completed" if dt<TODAY else ("Blocked — freeze" if "2026-11-20"<=dt<="2026-12-01" and risky else "Scheduled"),"exposure":R.choice(["1%","10%","100%"]),"squad":R.choice(six),"rollback":"Error rate > 1% or p99 > 800ms for 5 min","audit":[]})
freeze=[{"from":"2026-11-20","to":"2026-12-01","type":"Freeze (risky changes blocked)"},{"from":"2026-11-13","to":"2026-11-19","type":"Slush (risky changes need Head approval)"},{"from":"2026-12-21","to":"2027-01-03","type":"Holiday slush"}]
incidents=[]
incidents.append({"id":"INC-0001","sev":"S2","title":"Black Friday eve: checkout failures — DB connection-pool exhaustion","date":"2025-11-27","durationMin":41,"impact":"~18,000 failed checkouts","icId":"EMP-0024","cause":"Connection-pool configuration change shipped that afternoon (max pool lowered during a 'tidy-up'); pool exhausted under evening ramp.","status":"Closed — postmortem complete","canon":True,
  "decisionLog":[["19:02","Alerts: checkout error rate 6%; IC declared (Daan Visser)"],["19:06","Comms cadence set: 15-min updates to CMO/COO channel"],["19:11","Hypothesis: DB; pool saturation visible"],["19:18","Change calendar shows pool config change at 15:40 — rollback ordered"],["19:29","Rollback deployed; error rate falling"],["19:43","Recovered; monitoring 30 min before stand-down"],["20:15","Stood down; postmortem scheduled"]],
  "actions":[["Config changes to pools are 'risky' class, not standard","Done"],["Pool saturation alert at 80%","Done"],["Freeze window starts 7 days before peak","Done"],["Load test includes config-change rehearsal","In progress"]],"audit":[]})
for i in range(2,61):
    sev=R.choices(["S1","S2","S3","S4"],weights=[2,10,45,43])[0]
    sq=R.choice(six+["Search","Returns","Platform"])
    dt=d(TODAY,-R.randint(1,330))
    incidents.append({"id":f"INC-{i:04d}","sev":sev,"title":R.choice(["Elevated 5xx on","Latency spike in","Queue backlog in","Partial outage of","Degraded search in","Failed deploys in","Certificate expiry warning in","Payment declines spike in"])+" "+sq,"date":dt,"durationMin":R.randint(6,180),"impact":R.choice(["Minor; <0.1% users","Checkout degraded for a region","Internal only","~2% orders delayed"]),"icId":R.choice([p["id"] for p in people if p["role"].startswith("Engineering Manager")]),"cause":R.choice(["Bad config","Dependency timeout","Capacity","Code defect","Third-party outage","Expired certificate"]),"status":R.choice(["Closed — postmortem complete","Closed — postmortem complete","Actions open"]),"canon":False,"repeat":R.random()<0.18,"decisionLog":[],"actions":[["Fix forward","Done"],["Add alert","Done" if R.random()>0.3 else "Open"]],"audit":[]})
rotations=[{"squad":s,"primaryDepth":dpth,"pagesPerWeek":pg,"afterHoursPct":ah,"status":"Overloaded" if pg>10 else ("Watch" if pg>6 else "Healthy")} for s,dpth,pg,ah in [("Identity",4,17,62),("Checkout",8,5,30),("Payments",7,6,35),("Catalog",6,3,22),("Fulfilment",5,8,48),("Platform",6,4,25),("SRE",9,6,40),("Search",5,2,15),("Promotions",6,4,28)]]
slos=[{"id":f"SLO-{i+1:02d}","journey":j,"target":t,"budgetMin":bm,"burnPct":b,"state":st,"signoff":so} for i,(j,t,bm,b,st,so) in enumerate([
 ("Checkout — place order","99.9%",43,62,"Normal","Rohit Kulkarni"),("Payments — authorise","99.95%",22,38,"Normal","Rohit Kulkarni"),("Search — results","99.5%",216,81,"Caution","Maya Lindgren"),
 ("Login — authenticate","99.9%",43,108,"Frozen — reliability work only","Rhea Desai"),("Basket — add item","99.9%",43,24,"Normal","Rohit Kulkarni"),("Order tracking","99.5%",216,40,"Normal","Carlos Ortiz"),
 ("Product page — render","99.5%",216,55,"Normal","Maya Lindgren"),("Returns — create","99.0%",432,12,"Normal","Carlos Ortiz")])]
burn=[round(min(130,max(0,(i+1)*3.6+R.uniform(-4,6))),1) for i in range(30)]

# ---------------- GRC ----------------
findings=[{"id":f"FND-{i+1:03d}","sev":sv,"text":t,"status":st,"due":du,"evidence":ev,"audit":[]} for i,(sv,t,st,du,ev) in enumerate([
 ("Critical","Shared admin accounts in production","Closed","2026-03-31","PAM rollout log; account inventory diff"),
 ("Critical","No DR test in 26 months","Closed","2026-06-30","DR drill reports: 4h12m (first) → 38 min (third)"),
 ("Critical","Vendor access unreviewed","Closed","2026-05-31","Recert campaign VR-2026-1 diff"),
 ("High","Leaver access removal exceeds 24h (p95 6 days)","In remediation","2026-12-31","HR-feed automation; p95 now 30h"),
 ("High","Change approvals bypassed for config changes","Closed","2026-02-28","Pipeline gate config + INC-0001 action"),
 ("High","Secrets in environment files","In remediation","2026-12-15","Vault migration 82% complete"),
 ("Medium","Vulnerability SLA breaches on tier-2 apps","In remediation","2027-01-31","Backlog burn-down"),
 ("Medium","Exception register lacks expiry dates","Closed","2026-04-30","Register v2 with mandatory expiry"),
 ("Medium","SBOM not generated for 40% of services","In remediation","2027-02-28","Golden-path pipeline gate"),
 ("Low","Runbooks out of date for 12 services","In remediation","2026-12-31","Runbook freshness dashboard"),
 ("Low","Logging retention inconsistent","Closed","2026-07-31","Standard applied")])]
exceptions=[{"id":f"EXC-{i+1:04d}","control":c,"compensating":cc,"acceptorId":a,"expiry":e,"status":"Active" if e>=TODAY else "Expired — action needed","audit":[]} for i,(c,cc,a,e) in enumerate([
 ("TLS 1.2 minimum on legacy partner endpoint","IP allow-list + WAF rule","EMP-0008","2026-12-31"),("MFA for break-glass account","Sealed envelope + dual control + alert","EMP-0008","2026-11-10"),
 ("Vuln SLA: catalog image library CVE","Not reachable from internet; WAF","EMP-0021","2026-11-30"),("Pen-test overdue: returns service","Scheduled Dec; no PII stored","EMP-0022","2026-12-20"),
 ("Data retention: order logs","Masked PII; access restricted","EMP-0009","2026-10-31"),("SBOM missing: legacy batch","Network isolation","EMP-0024","2027-01-31")])]
vulns=[{"sev":s,"open":o,"breachingSla":b,"slaDays":sd} for s,o,b,sd in [("Critical",4,0,7),("High",37,6,30),("Medium",212,41,90),("Low",540,0,180)]]
recerts=[{"id":"VR-2026-1","scope":"Vendor access (all)","accounts":412,"revoked":96,"status":"Complete"},{"id":"AR-2026-Q3","scope":"Prod access (engineering)","accounts":288,"revoked":31,"status":"Complete"},{"id":"AR-2026-Q4","scope":"Prod access (engineering)","accounts":301,"revoked":None,"status":"In progress — 64% attested"}]
leaverP95=[144,130,120,96,72,60,48,40,36,30,30,30]
drDrills=[{"date":"2026-03-14","scope":"Checkout + payments (warm standby)","rtoTarget":"1h","result":"4h12m","notes":"Runbook gaps; DNS TTL; manual DB promotion"},{"date":"2026-06-20","scope":"Checkout + payments","rtoTarget":"1h","result":"1h21m","notes":"Automated DB promotion; DNS fixed"},{"date":"2026-09-26","scope":"Checkout + payments + identity","rtoTarget":"1h","result":"38m","notes":"RTO proven, not promised"},{"date":"2026-12-12","scope":"Full tier-1 set","rtoTarget":"1h","result":None,"notes":"Scheduled post-peak"}]
controls=[{"id":f"CTL-{i+1:03d}","control":c,"domain":dm,"evidence":ev,"status":st} for i,(c,dm,ev,st) in enumerate([
 ("Code review required for prod changes","SDLC","Pipeline branch protection logs","Effective"),("SAST/DAST in pipeline","SDLC","Golden-path gate results","Effective"),("Secrets scanning pre-commit","SDLC","Scanner reports","Effective"),
 ("Privileged access via PAM","Access","PAM session logs","Effective"),("Quarterly access recertification","Access","Recert campaign diffs","Effective"),("Leaver removal ≤ 24h","Access","HR-feed reconciliation","Partially effective"),
 ("DR tested twice yearly","Resilience","Drill reports","Effective"),("Backups restore-tested monthly","Resilience","Restore logs","Effective"),("Vendor tiering & annual re-attestation","Third party","Vendor register","Effective"),
 ("Breach notification ≤ 72h in critical contracts","Third party","Clause check","Partially effective"),("Exceptions expire and are re-approved","Governance","Exception register","Effective"),("Change classification (standard vs risky)","Change","Change records","Effective")])]

# ---------------- Board, DD, crisis ----------------
ddTarget={"name":"Parcelwise (fictional logistics scale-up)","ask":"Acquire for last-mile routing tech + 140 engineers","valuation":"$180M","docs":["Architecture overview (C4 L1-L2)","Org chart (140 eng, 3 sites)","Incident history (24 months)","Cloud bills (12 months)","Licence register","Security policies & pen-test summary","Key-person list","Tech debt self-assessment"],
  "checklist":[["Day 1","Architecture walkthrough; identify the 3 load-bearing systems"],["Day 2","Code sampling: 5 repos, test coverage, CI health"],["Day 3","Cloud bills: unit cost per delivery; commitments; egress"],["Day 4","Security: pen-test findings, secrets, access model"],["Day 5","Incident history: MTTR trend, repeat incidents"],["Day 6","People: key-person risk, attrition, comp vs market"],["Day 7","Licences & IP: open-source obligations, vendor lock-ins"],["Day 8","Integration plan sketch with Everline golden path"],["Day 9","Interviews: CTO, 2 staff engineers, SRE lead"],["Day 10","Priced verdict: integration cost, retention cost, risk discounts"]],
  "notes":[["CTO interview","Routing engine is genuinely differentiated; one person understands the optimiser end to end (key-person risk)."],["Cloud bills","Unit cost per delivery $0.31 — 2.1× ours; egress-heavy architecture; reserved commitments expire in 4 months."],["Incidents","MTTR improving; 3 repeat incidents in billing — tells you where the debt is."],["Security","Pen-test: 2 highs open > 90 days; secrets in repo history."]],
  "verdict":{"integrationCost":"$9.5M over 18 months","retention":"$4.2M (key-person + top 20 engineers)","riskDiscount":"$12M (key-person, billing debt, security remediation)","recommendation":"Proceed at ≤ $165M with retention package and 90-day security remediation as condition precedent"}}
crisis={"scenario":"Supplier breach: Harbourline Carriers API vendor reports unauthorised access to shipment data (names, addresses) for ~240,000 Everline customers.","started":"2026-10-29 07:40",
  "holding":["We are aware that one of our delivery-technology suppliers has reported a security incident. We are working urgently with them to understand whether any Everline customer information is affected. Our own systems are not affected. We will update customers directly as soon as we know more.","[Internal] Supplier incident under investigation; do not speculate externally; route all media to Comms; next update 12:00."],
  "tree":[["Personal data involved?","Yes — names & addresses (no payment data)"],["Risk to individuals?","Medium — phishing exposure"],["Regulator notification (72h)?","Yes — DPO filing by 2026-11-01 07:40"],["Customer notification?","Yes — direct email once scope confirmed"],["Public statement?","Holding statement now; full statement with customer notice"]],
  "lattice":[["Incident lead","Asha Rao"],["Legal","Robert Hale"],["DPO / regulator","Kwesi Mensah (CDO) + DPO"],["Comms","Corporate Comms lead"],["Supplier liaison","Carlos Ortiz"],["Customer service","COO org"],["Board","CEO via CIO"]],
  "cadence":[["T+0h","Holding statement approved"],["T+4h","Scope from supplier forensic"],["T+12h","Customer notice drafted"],["T+48h","Regulator notification filed"],["T+72h","Customer notices sent; FAQ live"]]}

# ---------------- Calendar ----------------
calendar=[
 {"date":"2026-11-03","title":"Monthly ops review with Viktor","cat":"exec","link":"#/boardroom"},
 {"date":"2026-11-04","title":"ARF: Loyalty v2 review","cat":"architecture","link":"#/archhub/review/ARF-2026-031"},
 {"date":"2026-11-05","title":"Budget: 15% cut options due to Dana","cat":"finance","kind":"bad","link":"#/finance/cuts","toast":"Dana expects the 15% cut options today."},
 {"date":"2026-11-06","title":"Kestrel (WMS) renewal negotiation","cat":"vendor","kind":"warn","link":"#/vendordesk/v/VEN-001","toast":"Kestrel renewal meeting: bring the exit price."},
 {"date":"2026-11-09","title":"Talent review: 9-box & succession","cat":"people","link":"#/peoplehub"},
 {"date":"2026-11-10","title":"Exception EXC-0002 expired (break-glass MFA)","cat":"security","kind":"bad","link":"#/trustdesk","toast":"Exception EXC-0002 has expired. Exceptions expire — renew with evidence or fix."},
 {"date":"2026-11-12","title":"QBR: Brightpath Talent","cat":"vendor","link":"#/vendordesk"},
 {"date":"2026-11-13","title":"Load test at 3× forecast (go/no-go)","cat":"reliability","kind":"warn","link":"#/archhub/capacity","toast":"Peak load test today — the capacity model meets reality."},
 {"date":"2026-11-13","title":"Slush window begins","cat":"change","kind":"warn","link":"#/releasegate"},
 {"date":"2026-11-20","title":"Change FREEZE begins (risky changes blocked)","cat":"change","kind":"bad","link":"#/releasegate","toast":"Change freeze in force until 1 Dec."},
 {"date":"2026-11-26","title":"Black Friday eve — war room staffed","cat":"reliability","kind":"bad","link":"#/oncall","toast":"Black Friday eve. Last year: 41 minutes, ~18k failed checkouts. War room is staffed."},
 {"date":"2026-11-27","title":"BLACK FRIDAY","cat":"reliability","kind":"bad","link":"#/slo"},
 {"date":"2026-12-03","title":"Board pack due (quarterly)","cat":"board","kind":"warn","link":"#/boardroom","toast":"Board pack due: bad news on slide 1, decisions on slide 8."},
 {"date":"2026-12-12","title":"DR drill — full tier-1 set","cat":"resilience","link":"#/trustdesk"},
 {"date":"2026-11-16","title":"Parcelwise DD: day 1","cat":"m&a","link":"#/dealroom"}]

# ---------------- Stakeholder matrix ----------------
stakeholderMatrix=[
 {"who":"Viktor Brandt","role":"CIO (your boss)","asks":"Monthly ops review, commitments-kept rate, top risks, budget position","channel":"Ops review + weekly 1:1","cadence":"Weekly / monthly","view":"BoardRoom ops pack; DeliveryBoard exec view","decides":"Priorities, escalations, funding asks to ExCo","great":"Bad news early with a plan — amber is rewarded.","poor":"Watermelon status: green outside, red inside."},
 {"who":"Dana Okoye","role":"CFO partner","asks":"Forecast vs actual, unit costs, cut options, vendor spend","channel":"FinancePortal + monthly finance review","cadence":"Monthly + budget season","view":"FinancePortal; showback","decides":"Budgets, cuts, capex rulings","great":"Priced options A/B/C with consequences; one-line variance causes.","poor":"A plea, or a single sacrificial number."},
 {"who":"Camille Laurent / Marcus Hughes","role":"CMO / COO","asks":"Delivery dates, campaign & peak capacity, incident impact","channel":"QBR + email","cadence":"Quarterly + peak season","view":"DeliveryBoard commitments; SLOBoard","decides":"Launches and trade-offs (the priced yes)","great":"P85 date and what a pull-in costs, in their currency.","poor":"Fake dates kept until they slip."},
 {"who":"Ingrid Solberg","role":"CISO","asks":"Control evidence, vulnerability SLAs, exceptions","channel":"TrustDesk","cadence":"Monthly + per exception","view":"TrustDesk","decides":"Risk acceptance; exceptions","great":"Expiring exceptions with compensating controls.","poor":"Evergreen exceptions."},
 {"who":"Thomas Ward","role":"Head of Internal Audit","asks":"Progress on 11 inherited findings (3 critical), recert diffs, DR results","channel":"TrustDesk + sample requests","cadence":"Quarterly + surprise","view":"TrustDesk read","decides":"Audit ratings and closures","great":"Closure evidence linked: 'show me' answered with a pipeline log.","poor":"'Done' without proof."},
 {"who":"June Bakker","role":"HR Business Partner","asks":"Headcount, attrition analysis, performance cases, comp exceptions","channel":"PeopleHub + weekly sync","cadence":"Weekly","view":"PeopleHub","decides":"Joint people actions; PIP sign-offs","great":"Cases documented before the conversation.","poor":"Surprise terminations."},
 {"who":"Rohit Kulkarni (+5 directors)","role":"Directors","asks":"Priorities, decision rights, air cover, reviews","channel":"1:1s + DeliveryBoard","cadence":"Weekly","view":"Their squad views","decides":"Within their delegated decision classes","great":"Clear charters and real delegation.","poor":"Seagull management."},
 {"who":"Lena Moreno","role":"Principal engineer","asks":"Standards, review backlog, tech-debt funding","channel":"ARF + 1:1","cadence":"Weekly","view":"ArchHub","decides":"Architecture recommendations","great":"Debt funded at 20% capacity; ARF decisions within a week.","poor":"Architecture as gatekeeping."},
 {"who":"Kestrel Systems & other vendors","role":"Vendors","asks":"Renewals, seat ramps, QBR responses, invoice approval","channel":"VendorDesk + QBR","cadence":"Quarterly + renewal windows","view":"Their shared scorecard","decides":"Pricing, staffing, roadmap commitments","great":"Negotiation from a priced exit.","poor":"Renewal signed in deadline panic."},
 {"who":"Kwesi Mensah","role":"Chief Data Officer","asks":"Data contracts, AI data boundaries","channel":"ArchHub + CopilotDesk","cadence":"Monthly","view":"CopilotDesk","decides":"Data standards","great":"Boundaries enforced in tooling.","poor":"Policy PDFs nobody reads."},
 {"who":"Laura Meijer / Robert Hale","role":"Procurement / Legal","asks":"RFP governance, clause checks, SOW approvals","channel":"VendorDesk","cadence":"Per event","view":"VendorDesk","decides":"Contract terms","great":"Weights locked before demos.","poor":"Single-bid renewals."},
 {"who":"Helena Marsh / Board","role":"CEO / Board","asks":"Quarterly pack","channel":"BoardRoom","cadence":"Quarterly","view":"Printed 8-slide pack","decides":"Strategy and investment","great":"Bad news slide 1, decisions slide 8.","poor":"40 slides of adjectives."},
 {"who":"Nadia Petrov / Ben Carter","role":"Other engineering heads","asks":"Dependency dates, shared-platform costs, incident handoffs","channel":"DeliveryBoard dependency map","cadence":"Monthly","view":"Shared dependency view","decides":"Cross-org priorities","great":"Dependencies with owners and dates.","poor":"Discovery during the incident."},
 {"who":"Journalist (crisis)","role":"External media","asks":"Statement on the supplier breach","channel":"CrisisDesk / EverMail","cadence":"Event-driven","view":"—","decides":"Publishes with or without you","great":"Holding statement inside the cadence.","poor":"'No comment' followed by leaks."}]

# ---------------- Messages ----------------
messages=[]
def M(mid,frm,ch,urg,due,subj,body,task,model,tone,att=None):
    messages.append({"id":mid,"from":frm,"channel":ch,"urgency":urg,"due":due,"subject":subj,"body":body,"task":task,"modelReply":model,"toneNotes":tone,"attachments":att or []})
M("MSG-0001","EMP-0004","email","high","2026-11-05","Group cost programme: 15% by Friday, no exceptions",
"Asha — Group has confirmed the cost programme: 15% off every technology line, no exceptions. For P&C that's $4.26M against the $28.4M. I need your submission by Thursday close so I can consolidate for the group CFO Friday. Please don't send me a plea — I've had nine of those already.\n\nDana",
{"label":"Build the 15% cut options in FinancePortal","link":"#/finance/cuts"},
"Dana — three priced options, not a plea:\n\nA. Pause bottom-quartile CTB programmes: saves $2.4M; two launches slip two quarters (Personalisation v3, Search relevance v4).\nB. Vendor ramp-down, 30 seats: saves $1.4M; delivery capacity −11%, concentrated in Fulfilment.\nC. Cloud rightsizing + licence rationalisation: saves $0.9M; one-off effort, low risk.\n\nRecommendation: C + A + half of B = $4.3M, clearing the $4.26M target with permanent-staff layoffs avoided — rebuilding a team costs two years; the cut will be forgotten in one. Workbook attached with every line traceable to the monthly actuals you already have.\n\nAsha",
"She needs a number she can forward unedited — options with consequences, a recommendation, and arithmetic that ties to the actuals she trusts.",["cut-options.xlsx (placeholder)"])
M("MSG-0002","EMP-0001","email","high","2026-11-06","Kestrel renewal: they say +40% or we walk",
"Asha, the Kestrel account director has escalated to me directly — 40% uplift on the WMS renewal, 'non-negotiable given the value delivered'. They clearly think we can't leave. Do we have a position before Thursday?\n\nViktor (forwarding on behalf of Helena's office)",
{"label":"Open the exit-pricing calculator for Kestrel","link":"#/vendordesk/v/VEN-001"},
"Viktor — yes. We've priced the honest exit: $3.1M and 14 months using the strangler pattern on the integration layer, with Oakridge as the scored alternative (RFP weights locked 1 Sept). Over the contract term the 40% rise costs more than leaving. Position for Thursday: share that maths calmly; ask for ≤10% with two roadmap commitments in writing and a proper exit clause. If they hold at 40%, we start the integration-layer strangler in Q1 — and we'd be fine. We don't need to exit to benefit from being able to.\n\nAsha",
"Vendors respect one position: a credible, priced exit. Viktor needs confidence and numbers he can repeat upward.")
M("MSG-0003","EMP-0020","chat","high","2026-11-04","Your Loyalty v2 'review' — my team is furious",
"Asha — Lena's pre-read on Loyalty v2 reads like a hit job. Five 'flaws' on a design my team spent six weeks on. If the ARF is going to be a gate that kills momentum, say so and we'll stop submitting. — Rohit",
{"label":"Run the Loyalty v2 review in ArchHub","link":"#/archhub/review/ARF-2026-031"},
"Rohit — fair challenge, and the forum's reputation is mine to own. Two of the five are real blockers (shared DB between Points and Rewards; session state in memory with horizontal scaling) — either would hurt us at Black Friday volumes. The other three are advisories with straightforward fixes; the idempotency one protects us from paying duplicate points on every timeout. I'll chair tomorrow myself: questions before verdicts, findings as risk → consequence → recommendation, and the team leaves with a path to approval in two weeks, not a rejection. Would you co-present the fixes with them? It changes the room.\n\nAsha",
"Rohit objects in public; answer with substance, own the forum's tone, and give him a role in the fix — sceptics become allies when given ownership.")
M("MSG-0004","EMP-0006","email","high","2026-11-09","Can we pull 'Winter Edit' forward a week?",
"Asha — the board loved the Winter Edit concept. Can we move the landing pages and promo engine from the 27th to the 20th? It's just a week. — Camille",
{"label":"Price the pull-in on DeliveryBoard commitments","link":"#/delivery"},
"Camille — yes, priced: the 20th is achievable at P85 if we move the Promotions refactor three weeks to the right. That refactor is what removes the manual rule-loading that caused two promo incidents last quarter, so the trade is real — slightly higher promo-incident risk through December. Alternatively, keep the 27th and nothing slips. Your call; I'll log whichever you choose as a visible trade on the commitments board.\n\nAsha",
"The priced yes: never a free yes, never a no — the cost, in the asker's currency, and the choice returned to them.")
M("MSG-0005","EMP-0022","email","high","2026-11-04","Resignation — Carlos",
"Asha, after a lot of thought I've accepted a VP role at a logistics company. My last day would be 4 December. I'm sorry about the timing with Black Friday and Fulfilment 2.0. — Carlos",
{"label":"Check succession lines in PeopleHub","link":"#/peoplehub"},
"Carlos — thank you for telling me directly, and congratulations; it's a real step and you've earned it. Three asks: (1) let's agree a handover plan this week — the Fulfilment reset is at move 4, and I'd like you and your succession candidate to run the carrier-API escalation together; (2) stay through peak as planned; (3) an honest exit conversation with June — I want to know what we could have done better. Your bench is ready because you built it.\n\nAsha",
"Director resignation: grace first, continuity second, learning third. The succession line from the talent review is why this is a handover, not a crisis.")
M("MSG-0006","EMP-0014","email","high","2026-11-11","Surprise sample: evidence for FND-002 closure (DR)",
"Asha — as part of Q4 fieldwork we are sampling closure evidence for FND-002 (no DR test in 26 months). Please provide drill reports, measured RTOs and the action log by the 11th. We'll test that the measured RTO matches what was reported to the Audit Committee.\n\nThomas Ward, Internal Audit",
{"label":"Assemble DR evidence in TrustDesk","link":"#/trustdesk"},
"Thomas — attached: three drill reports (14 Mar: 4h12m against a 1h RTO; 20 Jun: 1h21m; 26 Sep: 38 minutes), each with the action log between drills. One note to self-declare: the June result was reported to the Audit Committee as 'approximately one hour' — the measured figure was 1h21m. The September figure is exact. The next drill (full tier-1 set) is scheduled for 12 Dec.\n\nAsha",
"Audit tests consistency between evidence and what was reported upward. Self-declaring the rounding before they find it converts a finding into a note.")
M("MSG-0007","EMP-0012","email","medium","2026-11-10","Attrition: 19% vs market 12% — Viktor asked for a diagnosis",
"Asha — Viktor wants the attrition story for the ops review. Headline 19% vs 12% market, senior engineers 27%. Exit-interview themes are coded. Can you own the narrative and the actions? — June",
{"label":"Open the attrition dashboard","link":"#/peoplehub/attrition"},
"June — narrative: 19% overall vs 12% market, but the story is seniors: 27% annualised in H1, falling to 14% after Q3 actions. Coded exit themes, in order: growth path > legacy-only work > manager churn > comp. Comp is fourth — so a pay rise alone would have been an expensive non-answer. Actions tied to themes: growth-path docs for every senior; legacy teams rotated onto Atlas work; two manager changes stabilised; targeted comp for 11 compa-ratio outliers. I'll present it as cohort cuts, not anecdotes.\n\nAsha",
"Attrition answers rank causes by evidence before spending money. The order of the exit themes is the whole insight.")
M("MSG-0008","EMP-0008","ticket","high","2026-11-10","Exception EXC-0002 expires today",
"SEC-EXC: Exception EXC-0002 (MFA for break-glass account) expires 10 Nov. Exceptions do not auto-renew. Renew with evidence of compensating controls or close by implementing the control. — CISO office",
{"label":"Decide the exception in TrustDesk","link":"#/trustdesk"},
"Closing it rather than renewing: hardware-key MFA for break-glass ships this sprint (Rhea's team, 3 days of work). Interim 7-day renewal requested with the existing compensating controls (sealed credential, dual control, alert on use) and a hard expiry — not a 6-month evergreen. Exceptions expire; this one will.",
"Exceptions expire — renew only short, with a dated fix. Evergreen exceptions are where audit findings come from.")
M("MSG-0009","EMP-0049","chat","medium","2026-11-12","TalentBridge pushing Gavin Holt again",
"Asha — TalentBridge says the panel 'miscalibrated' on Gavin Holt and wants a re-loop. Two no-hires on system design already. They're our biggest agency. — hiring coordinator",
{"label":"Review the candidate in TalentHub","link":"#/talenthub"},
"No re-loop. Two independent panels scored system design 2/5 against the rubric anchors, with written evidence. Tell TalentBridge the decision stands, thank them, and ask for two more candidates against the same profile. If they push again, that's a signal about the agency, not the panel.",
"A weak candidate pushed by a recruiter is answered by process, kindly and finally. Re-loops on pressure teach every agency that your bar is negotiable.")
M("MSG-0010","EMP-0007","email","medium","2026-11-13","Black Friday: can we take 3× last year's traffic?",
"Asha — marketing is forecasting 3× peak after the TV campaign. I need a yes or no I can take to the board. 'Probably' won't do. — Marcus",
{"label":"Run the capacity calculator in ArchHub","link":"#/archhub/capacity"},
"Marcus — yes, after one dated fix. The model at 26M orders/day ×8 peak gives 2,407 TPS and ~7,222 DB writes/s across 4 shards and 27 pods. At 3× the first ceiling is the database shards at 2.2× — so: split two shards (two weeks, plan attached), then re-run the load test on 13 Nov at 3× as the go/no-go. If it passes, it's a signed yes; if not, you'll hear it from me that day with the fallback (queue-based checkout throttling).\n\nAsha",
"'Probably' becomes a dated, costed yes: the first ceiling named, the fix dated, and a test that rehearses the forecast before the campaign.")
for i,(frm,ch,subj,body,link,model,tone) in enumerate([
 ("EMP-0030","chat","Flaky tests are now our #1 friction (3.9/5)","DevEx survey: flaky tests top friction at 3.9/5. Can we fund a fix-it rotation?","#/pulsemetrics","Yes — funded: two engineers on a quarantine-and-fix rotation for Q4, success measured as flaky-test reruns per week and the survey score next quarter. Publish the delta beside the DORA board.","DevEx survey answers need funded actions with owners, or the survey becomes theatre."),
 ("EMP-0023","email","Identity squad on-call: 17 pages/week","Identity is at 17 pages/week, 62% after-hours. Two engineers asked to leave the rota. Help.","#/oncall","Agreed: Identity SLO is in 'frozen' state anyway — reliability work only until burn recovers. Actions: top-5 noisy alerts deleted or fixed this sprint, rota depth from 4 to 7 by borrowing two Platform engineers for a quarter, and a pages/week target under 6. SSO wave 2 slips accordingly — I'll tell Ingrid.","On-call health is a retention issue; the error-budget policy gives you the authority to stop feature work."),
 ("EMP-0004","email","October actuals: three variances over 5%","Three lines above ±5% in October. Causes?","#/finance","Done in FinancePortal — each line has its one-line cause (load-test environments; observability true-up; hiring slip underspend). Forecast unchanged.","Variance discipline makes the crisis-month credible: Dana believes your options because she believes your monthly causes."),
 ("EMP-0024","chat","Freeze window: Rohit wants an exception for a payments SDK bump","Payments SDK bump flagged risky. Freeze starts 20th. Exception?","#/releasegate","Ship it before the 20th via 1% → 10% → 100% exposure with the standard rollback criteria, or after 1 Dec. No freeze exceptions for convenience — the freeze exists because of last year's 41 minutes.","Freeze windows are only real if the head refuses convenience exceptions."),
 ("EMP-0009","email","AI code assistant: data boundary question","Teams asking whether they can paste customer data into the code assistant for debugging.","#/copilotdesk","No — the boundary is source code only, no customer data, and it's enforced at the gateway, not just the policy page. For debugging, use the masked datasets in staging. I'll add an example to the adoption FAQ.","Boundaries enforced in tooling beat policy PDFs."),
 ("EMP-0012","email","Comp review: 11 compa-ratio outliers, exception budget $180k","We have $180k exception budget and 11 seniors below 0.88 compa-ratio. Prioritise?","#/peoplehub/comp","Prioritise by flight risk × criticality: 6 of the 11 are on Atlas or payments critical paths with high flight risk — they get the first $140k; remaining $40k across the other five in the next cycle. Documented against the band so it survives calibration.","Comp exceptions are business cases with a ranking rule, not favours."),
 ("EMP-0021","chat","Promotions CFR 15% — am I in trouble?","Saw Promotions at 15% CFR on the Q4 board. Is this a performance conversation?","#/pulsemetrics","No — metrics locate conversations, never verdicts. Let's look together: my bet is the manual rule-loading path (two promo incidents). If so, it's an investment ask, not a performance issue. And the four keys move together or not at all — nobody targets CFR alone.","DORA as a management system: metrics open conversations; they never close them."),
 ("EMP-0015","email","Carrier API v2: realistic date","Fulfilment needs our carrier API v2. Team says 'two weeks'.","#/delivery","It has been 'two weeks' for nine months, so I've escalated it into my portfolio with a named owner on each side and a P85 date. Can we agree a weekly 15-minute dependency check until it ships? I'll fund one integration engineer to sit with your team.","A dependency 'two weeks away' for nine months is a structural cause — the fourth of the five moves."),
 ("EMP-0025","chat","Data & Personalisation: director backfill shortlist","Shortlist of 3 for the director backfill. Loop next week?","#/talenthub","Yes — org-design case, system design, written exercise and behavioural, same anchors as the last director loop. I want one external and one internal candidate in the final two.","Director loops test the actual job: an org-design case beats generic leadership questions."),
 ("EMP-0010","email","RFP: Oakridge pilot results in","Pilot results: 2 warehouses, p95 210ms, zero sev incidents.","#/vendordesk/rfp","Thanks — scored against the weights locked on 1 Sept. Oakridge leads on exit & portability; incumbent leads on nothing except familiarity. Recommendation drafted for Viktor, with the exit maths.","Weights locked before demos make the result defensible."),
 ("EMP-0016","email","Shared-platform chargeback: my teams are angry","Enterprise IT teams say showback numbers are wrong.","#/finance/showback","Let's walk the numbers together. Showback before chargeback exactly so we can fix tagging disputes before money moves. Untagged spend is down to 4% — I'll show which resources are attributed to your teams and why.","Showback first: survive the screams before money moves."),
 ("EMP-0002","chat","Board pack: what's slide 1?","Draft board pack due 3 Dec. What's your slide 1?","#/boardroom","Slide 1: Atlas Catalog cutover slipped a quarter (CDC lag), Fulfilment 2.0 is still amber-red, and senior attrition was 27% before it fell to 14%. Then the plan. Slide 8 asks for two decisions: modernisation funding protected from the cut, and the Parcelwise DD go/no-go.","Bad news travels on slide 1 — it's the cheapest place to put it."),
 ("EMP-0030","chat","Golden path: first-commit time","Median time to first commit for new joiners is 3.5 days. Target?","#/pulsemetrics","4 hours for a new service on the golden path, 1 day for a new joiner's first commit. Track it monthly beside DORA.","Platform is a product; time-to-first-commit is its truth metric."),
 ("EMP-0011","email","Supplier breach: legal hold and statement review","Harbourline incident: legal hold issued. Please route all statements through me.","#/crisisdesk","Confirmed. Holding statement drafted on CrisisDesk for your review; no external statements without Legal and Comms sign-off; DPO preparing the 72h notification.","Crisis comms run on a lattice of named roles and a cadence."),
 ("EMP-0006","email","Journalist asking about 'Everline data breach'","A reporter from a trade outlet is asking whether Everline customer data was stolen. Deadline 16:00.","#/crisisdesk","Use the approved holding statement only: a supplier reported an incident; we're working urgently to establish whether customer information is affected; our systems are not affected; we'll update customers directly. No speculation on numbers. Route follow-ups to Comms.","A holding statement inside the cadence beats 'no comment' followed by leaks."),
 ("EMP-0002","email","Parcelwise DD: 10 days, priced verdict","CEO wants a priced verdict on Parcelwise in 10 working days.","#/dealroom","Plan is on DealRoom: architecture, code, cloud bills, security, incidents, people, licences, integration sketch, interviews, verdict. Early read: the routing engine is real but key-person-dependent; unit cost per delivery is 2.1× ours. Verdict will carry integration, retention and risk discounts as numbers.","Diligence ends in a priced verdict, not an opinion."),
 ("EMP-0024","email","Postmortem actions: completion at 64%","Postmortem action completion rate is 64% over 90 days.","#/oncall","Below the 85% bar. Actions now tracked like incident work: owner, due date, weekly review in the ops meeting, and any action older than 30 days escalates to the director.","Postmortems without completed actions are theatre."),
 ("EMP-0023","chat","Leaver access p95 now 30h","HR-feed automation live; p95 at 30h vs 24h target.","#/trustdesk","Good progress from 6 days. Last mile: the vendor-onboarding system isn't on the HR feed — add it and we cross 24h. Keep FND-004 open until two months below target.","Close findings on sustained evidence, not first success."),
 ("EMP-0004","email","FinOps: unit cost per order at $0.118","Hit the target early. Can we bank the saving?","#/finance/finops","Yes — $0.142 → $0.118 per order. Bank it in option C of the cut. Keep untagged spend under 5%.","Unit economics turn FinOps into a shared language with Finance."),
 ("EMP-0020","chat","Atlas Catalog cutover slipping","CDC lag under peak test: cutover moves to Feb.","#/delivery/atlas","Accept the slip, publish it on the commitments board as a visible trade, and keep the reversibility rule. Same-quarter retirement still applies after cutover.","Trade a fake date for a real one."),
 ]):
    M(f"MSG-{11+i:04d}",frm,ch,"medium" if i%3 else "low",d(TODAY,R.randint(1,12)) if i%2==0 else None,subj,body+"\n\n— "+next(p["name"] for p in people if p["id"]==frm),{"label":"Open the linked module","link":link},model,tone)
notices=[("EMP-0024","Change calendar: 14 risky changes scheduled before freeze","#/releasegate"),("EMP-0012","Calibration room opens Monday","#/peoplehub"),("EMP-0004","November forecast template ready","#/finance"),("EMP-0010","Quillcheck renewal in 8 weeks","#/vendordesk"),("EMP-0030","3 ADRs awaiting decision","#/archhub"),("EMP-0023","Golden-path adoption: 61 services","#/pulsemetrics"),("EMP-0024","SLO burn: Search in caution","#/slo"),("EMP-0021","Promotions refactor kickoff","#/delivery"),("EMP-0012","Engagement survey closes Friday","#/peoplehub"),("EMP-0008","Vulnerability SLA report","#/trustdesk"),("EMP-0014","Audit committee date: 9 Dec","#/trustdesk"),("EMP-0002","1:1 agenda: Black Friday, attrition, cuts","#/boardroom"),("EMP-0025","Personalisation experiment results","#/delivery"),("EMP-0022","Fulfilment warehouse 2 go-live plan","#/delivery"),("EMP-0009","Data contracts rollout status","#/archhub"),("EMP-0010","Invoice dispute: Coralline Digital October","#/vendordesk"),("EMP-0024","Load-test environment booked for 13 Nov","#/archhub/capacity"),("EMP-0012","Skip-level schedule for November","#/peoplehub"),("EMP-0030","Tech radar draft for review","#/archhub"),("EMP-0023","Exception request: TLS on legacy partner","#/trustdesk"),("EMP-0004","Capex/opex tagging check","#/finance"),("EMP-0007","Peak staffing plan (warehouses)","#/delivery"),("EMP-0016","Shared service catalogue update","#/archhub"),("EMP-0015","Logistics Core release train dates","#/delivery"),("EMP-0006","Winter Edit creative assets ready","#/delivery"),("EMP-0021","Search relevance v4 demo","#/delivery"),("EMP-0024","DR drill planning: 12 Dec","#/trustdesk"),("EMP-0013","Leadership offsite save-the-date","#/calendar"),("EMP-0012","Two promotion packets ready for review","#/peoplehub"),("EMP-0030","Loyalty v2 resubmission ETA","#/archhub")]
for i,(frm,subj,link) in enumerate(notices):
    M(f"MSG-{31+i:04d}",frm,R.choice(["chat","email","ticket","meeting"]),"low",None,subj,"FYI / action as per subject.\n\n— "+next(p["name"] for p in people if p["id"]==frm),{"label":"Open","link":link},"Acknowledged and actioned via the linked module.","Routine traffic — the skill is fast routing and inbox zero.")

# ---------------- Attrition & engagement ----------------
attrition={"overall":19,"market":12,"seniorH1":27,"seniorNow":14,"monthly":[22,23,24,25,24,22,21,20,19,18,18,19],"seniorMonthly":[25,26,27,27,27,26,22,19,17,15,14,14],
 "themes":[["Growth path",34],["Legacy-only work",27],["Manager churn",21],["Compensation",18]],
 "cohorts":[["Pune",17],["Rotterdam",21],["Austin",20],["L3-L4",15],["L5-L6",22],["Vendor (contract end)",24]]}
engagement={"score":68,"prev":61,"items":[["I see a growth path here",54],["My work is meaningful",71],["My manager supports me",74],["We ship without unnecessary friction",58],["I'd recommend Everline engineering",66]]}

seed={"people":people,"squads":squad_list,"perfCases":perfCases,"pips":pips,"reqs":reqs,"candidates":cands,"vendors":vendors,"sows":sows,"invoices":invoices,"qbrs":qbrs,"rfp":rfp,
 "budget":budget,"purchaseReqs":purchaseReqs,"showback":showback,"programs":programs,"fulfilmentReset":fulfilmentReset,"okrs":okrs,"plan":plan,"commitments":commitments,"atlas":atlas,
 "dora":dora,"devex":devex,"flow":flow,"aiMetrics":aiMetrics,"aiTools":aiTools,"adrs":adrs,"archReviews":archReviews,"radar":radar,"apps":apps,"debt":debt,"capacity":capacity,
 "changes":changes,"freeze":freeze,"incidents":incidents,"rotations":rotations,"slos":slos,"sloBurn":burn,"findings":findings,"exceptions":exceptions,"vulns":vulns,"recerts":recerts,"leaverP95":leaverP95,"drDrills":drDrills,"controls":controls,
 "ddTarget":ddTarget,"crisis":crisis,"calendar":calendar,"stakeholderMatrix":stakeholderMatrix,"messages":messages,"attrition":attrition,"engagement":engagement,"months":MONTHS,"quarters":QUARTERS,
 "headcount":{"engineers":n_perm+n_vend,"perm":n_perm,"vendor":n_vend}}
base=os.path.join(os.path.dirname(__file__),"..","data"); os.makedirs(base,exist_ok=True)
with open(os.path.join(base,"seed.js"),"w") as f:
    f.write("/* Generated by tools/generate_seed.py — deterministic, seed 20261102. Do not hand-edit. */\nwindow.SEED = "); json.dump(seed,f,separators=(",",":")); f.write(";\n")
with open(os.path.join(base,"DICTIONARY.md"),"w") as f:
    f.write("# Everline Seed Data Dictionary\n\nGenerated by tools/generate_seed.py (deterministic, seed 20261102).\n\n")
    for k,v in seed.items():
        if isinstance(v,list) and v and isinstance(v[0],dict): f.write(f"## {k} ({len(v)} records)\nFields: "+", ".join(sorted(v[0].keys()))+"\n\n")
        elif isinstance(v,dict): f.write(f"## {k}\nKeys: "+", ".join(sorted(v.keys()))+"\n\n")
print("people",len(people),"engineers",n_perm+n_vend,"perm",n_perm,"vendor",n_vend,"reqs",len(reqs),"cands",len(cands),"vendors",len(vendors),"incidents",len(incidents),"adrs",len(adrs),"apps",len(apps),"msgs",len(messages))
