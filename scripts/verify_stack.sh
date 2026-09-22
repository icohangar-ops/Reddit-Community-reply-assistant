#!/usr/bin/env bash
# Evidence for matrix rows C007/C009/C010: the Next.js App Router tree is
# present (src/app, no pages/ directory), the Prisma datasource is SQLite, and
# the shadcn/ui component directory is populated.
# Static, deterministic checks — no network, no dependencies.
set -euo pipefail
cd "$(dirname "$0")/.."

test -f src/app/layout.tsx
test -f src/app/page.tsx
test ! -d pages
grep -q 'provider = "sqlite"' prisma/schema.prisma
ls src/components/ui/*.tsx >/dev/null
