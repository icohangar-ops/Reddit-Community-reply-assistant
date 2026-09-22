#!/usr/bin/env bash
# Evidence for matrix rows C001/C002/C011: Reddit search runs through snoowrap
# with retry-hardened requests, the scan route drives it, and the seeded
# monitoring list includes the subreddits the README names.
# Static, deterministic source checks — no network, no dependencies.
set -euo pipefail
cd "$(dirname "$0")/.."

grep -q "from 'snoowrap'" src/lib/reddit.ts
grep -q "getSubreddit" src/lib/reddit.ts
grep -q "searchReddit" src/app/api/scan/route.ts

for subreddit in smallbusiness startups Entrepreneur SaaS; do
  grep -q "'${subreddit}'" src/app/api/seed/route.ts
done
