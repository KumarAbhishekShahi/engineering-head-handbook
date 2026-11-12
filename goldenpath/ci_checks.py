"""Stand-in for the golden-path CI: the checks every Everline service must pass."""
import os, re
checks = []
src = open("app/service.py").read()
checks.append(("healthcheck endpoint present", "/healthz" in src))
checks.append(("structured logging used", "json.dumps" in src))
checks.append(("idempotency handled", "idempotent_replay" in src))
checks.append(("no secrets in source", not re.search(r"(password|secret_key)\s*=\s*['\"]", src)))
checks.append(("IaC stub present", os.path.exists("infra/main.tf")))
for name, ok in checks:
    print(f"  [{'PASS' if ok else 'FAIL'}] {name}")
print(f"gate: {'PASS' if all(ok for _, ok in checks) else 'FAIL'} ({sum(ok for _, ok in checks)}/{len(checks)})")
