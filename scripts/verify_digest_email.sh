#!/usr/bin/env bash
# Evidence for matrix row C006: the digest email takes the top-ranked threads
# (top 10), sends via SMTP (nodemailer), and the digest API dispatches it
# ranked by total score. Static, deterministic source checks — no network, no
# dependencies, no email sent.
set -euo pipefail
cd "$(dirname "$0")/.."

grep -q "threads.slice(0, 10)" src/lib/email-service.ts
grep -q "createTransport" src/lib/email-service.ts
grep -q "sendMail" src/lib/email-service.ts
grep -q "sendDigestEmail" src/app/api/digest/route.ts
grep -q "orderBy: { totalScore: 'desc' }" src/app/api/digest/route.ts
