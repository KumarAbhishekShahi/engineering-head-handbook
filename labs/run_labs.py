import io, sys, contextlib, os, traceback
sys.path.insert(0, os.path.dirname(__file__))
import labs_core as L
LABS = {n: getattr(L, n) for n in ["lab_budget","lab_finops","lab_dora","lab_devex",
        "lab_capacity","lab_incident","lab_attrition","lab_goldenpath"]}
out = os.path.join(os.path.dirname(__file__), "..", "build", "labout"); os.makedirs(out, exist_ok=True)
fails=[]
for n, fn in LABS.items():
    b = io.StringIO()
    try:
        with contextlib.redirect_stdout(b): fn()
        open(os.path.join(out, n + ".txt"), "w").write(b.getvalue())
        print("ok", n)
    except Exception: fails.append(n); traceback.print_exc()
print("FAILED:", fails or "none")
