#!/usr/bin/env bash
# Run this AFTER `npx supabase login` (browser OAuth as 1pulse.os@gmail.com)
# This links the CLI to the permanent production Supabase project and applies all migrations.

set -euo pipefail

PROD_REF="aqsegdzptwbyrasblrch"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(dirname "$SCRIPT_DIR")"

echo "==> Linking to production Supabase project: $PROD_REF"
cd "$REPO_ROOT"

npx supabase@latest link --project-ref "$PROD_REF"

echo "==> Applying migrations 0001–0009"
npx supabase@latest db push --include-all

echo "==> Generating TypeScript types"
npx supabase@latest gen types typescript \
  --project-id "$PROD_REF" \
  --schema public \
  > apps/web/lib/types/database.ts

echo ""
echo "==> Done. Next steps:"
echo "    1. Update Vercel env vars:"
echo "       NEXT_PUBLIC_SUPABASE_URL=https://${PROD_REF}.supabase.co"
echo "       NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key from Supabase dashboard>"
echo "    2. Trigger a Vercel production deployment"
echo "    3. Run acceptance tests against production HTTPS URL"
echo "    4. Update docs/PRODUCTION_ACCEPTANCE_REPORT.md"
