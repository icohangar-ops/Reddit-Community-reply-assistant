#!/usr/bin/env bash
# Evidence for matrix rows C019/C020/C022: the state-machine file defines the
# README's four decision states plus CONFIRM/REJECT third-party validation, and
# the compliance file records the CHP version string.
# Static, deterministic checks — no network, no dependencies.
set -euo pipefail
cd "$(dirname "$0")/.."

for state in EXPLORING PROVISIONAL PROVISIONAL_LOCK LOCKED; do
  grep -q -- "- ${state}:" .chp/STATE_MACHINE.md
done

grep -q "Third-Party Validation" .chp/STATE_MACHINE.md
grep -q "CONFIRM" .chp/STATE_MACHINE.md
grep -q "REJECT" .chp/STATE_MACHINE.md
grep -q "CHP Version: cognitive-mesh-orchestrator 0.1.0" .chp/CHP_COMPLIANCE.md
