# everline-golden-path IaC stub: one service, one alarm, tagged ownership
module "service" {
  source = "../modules/app-service"
  name   = "golden-path"
  owner  = "platform-engineering"
  alarms = { p99_latency_ms = 250, error_rate_pct = 1 }
}
