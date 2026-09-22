#!/usr/bin/env bash
# Evidence for matrix rows C005/C012: the drafting system prompt carries the
# Reddit etiquette rules (no company mentions, no pitching, no marketing
# language) and drafts are produced by an LLM chat completion with retry on
# transient failures. Static, deterministic source checks — no network, no
# dependencies, no LLM call.
set -euo pipefail
cd "$(dirname "$0")/.."

grep -q "NEVER mention your company name or website in the reply" src/lib/reply-drafter.ts
grep -q "NEVER sound like an ad or pitch" src/lib/reply-drafter.ts
grep -q "Never use marketing language or buzzwords" src/lib/reply-drafter.ts
grep -q "z-ai-web-dev-sdk" src/lib/reply-drafter.ts
grep -q "chat.completions.create" src/lib/reply-drafter.ts
grep -q "retry(" src/lib/reply-drafter.ts
