#!/usr/bin/env bash
# Evidence for matrix rows C003/C004: runs the pure-TypeScript scoring tests
# (tests/scoring.test.ts) with Node's built-in type stripping. No dependency
# installation is required — src/lib/scorer.ts has no runtime imports — so this
# runs inside the evidence-matrix CI gate before any install step.
# No network access. Exit 0 = scoring claims verified.
set -euo pipefail
cd "$(dirname "$0")/.."
exec node --experimental-strip-types --test tests/scoring.test.ts
