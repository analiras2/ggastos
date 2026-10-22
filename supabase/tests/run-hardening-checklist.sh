#!/usr/bin/env bash
# Automated subset of the MVP hardening checklist (Milestone 4, T9, requirement CLS-04).
# See .specs/features/closing-hardening/hardening-checklist.md for the full checklist,
# including the manual items this script does not (and cannot safely) cover.
#
# Run from the repo root:
#   supabase start
#   supabase functions serve --env-file supabase/functions/.env &
#   supabase/tests/run-hardening-checklist.sh
#
# Exits non-zero on the first failure — a non-zero exit here must block UAT.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$REPO_ROOT"

echo "== 1/2: migrations (supabase db reset) =="
if ! supabase db reset; then
  echo "FAIL: supabase db reset did not complete cleanly."
  exit 1
fi
echo "PASS: migrations + seed applied cleanly."
echo

echo "== 2/2: RLS suite (supabase/tests/rls-suite.mjs) =="
if ! node "$REPO_ROOT/supabase/tests/rls-suite.mjs"; then
  echo "FAIL: RLS suite reported failures."
  exit 1
fi
echo "PASS: RLS suite passed."
echo

echo "Automated hardening gate passed. Remaining manual items are documented in:"
echo "  .specs/features/closing-hardening/hardening-checklist.md"
