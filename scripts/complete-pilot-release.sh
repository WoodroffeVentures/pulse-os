#!/usr/bin/env bash
# PULSE Pilot Release 1 — Complete close-out script
# Run this ONCE from your terminal. Two browser windows will open:
#   1. Supabase OAuth  (sign in as 1pulse.os@gmail.com)
#   2. Vercel OAuth    (sign in as woodroffe.ventures@gmail.com)
# Everything else is automatic. Secrets are never printed.

set -euo pipefail

PROD_REF="aqsegdzptwbyrasblrch"
VERCEL_PROJECT_ID="prj_kxZlZOrHXEOMOMFocYcDlE54wlh6"
VERCEL_TEAM_ID="team_Jllioov1rDhtpWUFnnSk8rNx"
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

log()  { echo ""; echo "==> $*"; }
warn() { echo "    [WARN] $*"; }
die()  { echo ""; echo "[ERROR] $*" >&2; exit 1; }

cd "$REPO_ROOT"

# ─── 1. Supabase authentication ───────────────────────────────────────────────
log "Authenticating with Supabase (browser will open — sign in as 1pulse.os@gmail.com)"
npx supabase@latest login
log "Linking to production project: $PROD_REF"
npx supabase@latest link --project-ref "$PROD_REF"

# ─── 2. Apply all migrations ──────────────────────────────────────────────────
log "Applying migrations 0001–0009 to $PROD_REF"
npx supabase@latest db push --include-all

# ─── 3. Fetch anon key (stored only in shell var, never printed) ──────────────
log "Fetching production anon key"
ANON_KEY=$(npx supabase@latest projects api-keys --project-ref "$PROD_REF" \
  --output json 2>/dev/null \
  | python3 -c "import sys,json; keys=json.load(sys.stdin); print(next(k['api_key'] for k in keys if k['name']=='anon'))")

if [ -z "$ANON_KEY" ]; then
  # Fallback: try management API
  ACCESS_TOKEN=$(cat ~/.supabase/access-token 2>/dev/null || true)
  if [ -n "$ACCESS_TOKEN" ]; then
    ANON_KEY=$(curl -sf \
      -H "Authorization: Bearer $ACCESS_TOKEN" \
      "https://api.supabase.com/v1/projects/$PROD_REF/api-keys" \
      | python3 -c "import sys,json; keys=json.load(sys.stdin); print(next(k['api_key'] for k in keys if k['name']=='anon'))")
  fi
fi

[ -z "$ANON_KEY" ] && die "Could not retrieve anon key. Open Supabase dashboard → Settings → API → anon key and run: ANON_KEY=<paste> bash scripts/complete-pilot-release.sh --skip-supabase"

SUPABASE_URL="https://${PROD_REF}.supabase.co"
log "Anon key retrieved (not printed)"

# ─── 4. Generate TypeScript types ─────────────────────────────────────────────
log "Generating TypeScript types from production schema"
npx supabase@latest gen types typescript \
  --project-id "$PROD_REF" \
  --schema public \
  > apps/web/lib/types/database.ts
echo "    Written to apps/web/lib/types/database.ts"

# ─── 5. Vercel authentication ─────────────────────────────────────────────────
log "Authenticating with Vercel (browser will open — sign in as woodroffe.ventures@gmail.com)"
npx vercel@latest login

# ─── 6. Update Vercel environment variables ───────────────────────────────────
log "Updating Vercel environment variables for production + preview"

# Remove old values first (ignore errors if they don't exist)
npx vercel@latest env rm NEXT_PUBLIC_SUPABASE_URL production --yes 2>/dev/null || true
npx vercel@latest env rm NEXT_PUBLIC_SUPABASE_URL preview   --yes 2>/dev/null || true
npx vercel@latest env rm NEXT_PUBLIC_SUPABASE_ANON_KEY production --yes 2>/dev/null || true
npx vercel@latest env rm NEXT_PUBLIC_SUPABASE_ANON_KEY preview   --yes 2>/dev/null || true

# Add new values
echo "$SUPABASE_URL" | npx vercel@latest env add NEXT_PUBLIC_SUPABASE_URL production
echo "$SUPABASE_URL" | npx vercel@latest env add NEXT_PUBLIC_SUPABASE_URL preview
echo "$ANON_KEY"     | npx vercel@latest env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
echo "$ANON_KEY"     | npx vercel@latest env add NEXT_PUBLIC_SUPABASE_ANON_KEY preview

log "Environment variables updated (values not printed)"

# ─── 7. Update local .env.local for dev consistency ──────────────────────────
# Only rewrite the two Supabase lines; never print secrets to console
log "Updating apps/web/.env.local"
ENVFILE="$REPO_ROOT/apps/web/.env.local"
# Create a temp file without the old supabase lines
grep -v 'NEXT_PUBLIC_SUPABASE_URL\|NEXT_PUBLIC_SUPABASE_ANON_KEY' "$ENVFILE" > "$ENVFILE.tmp" || true
printf 'NEXT_PUBLIC_SUPABASE_URL=%s\n' "$SUPABASE_URL" >> "$ENVFILE.tmp"
printf 'NEXT_PUBLIC_SUPABASE_ANON_KEY=%s\n' "$ANON_KEY" >> "$ENVFILE.tmp"
mv "$ENVFILE.tmp" "$ENVFILE"
echo "    Updated (values not printed)"

# ─── 8. Commit types and env change ──────────────────────────────────────────
log "Committing generated types"
git add apps/web/lib/types/database.ts
git diff --cached --quiet && echo "    No type changes to commit" || \
  git commit -m "chore: regenerate types from production schema (aqsegdzptwbyrasblrch)

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"

# ─── 9. Push to GitHub and deploy ─────────────────────────────────────────────
log "Pushing main to GitHub (triggers Vercel production deployment)"
git push origin main

log "Triggering explicit Vercel production deployment"
npx vercel@latest --prod --yes 2>&1 | tail -5

# ─── 10. Configure Storage buckets (Supabase Management API) ─────────────────
log "Configuring Storage tenant isolation"
ACCESS_TOKEN=$(cat ~/.supabase/access-token 2>/dev/null || true)
if [ -n "$ACCESS_TOKEN" ]; then
  for BUCKET in property-images evidence-uploads; do
    STATUS=$(curl -sf -o /dev/null -w "%{http_code}" \
      -X POST "https://api.supabase.com/v1/projects/$PROD_REF/storage/buckets" \
      -H "Authorization: Bearer $ACCESS_TOKEN" \
      -H "Content-Type: application/json" \
      -d "{\"id\":\"$BUCKET\",\"name\":\"$BUCKET\",\"public\":false,\"fileSizeLimit\":10485760}" \
      2>/dev/null || echo "000")
    if [ "$STATUS" = "200" ] || [ "$STATUS" = "201" ] || [ "$STATUS" = "409" ]; then
      echo "    Bucket '$BUCKET': OK (status $STATUS)"
    else
      warn "Bucket '$BUCKET' creation returned $STATUS — create manually in Supabase dashboard → Storage"
    fi
  done
else
  warn "No Supabase access token found for Management API — create buckets manually in Supabase dashboard → Storage"
fi

# ─── 11. Summary ─────────────────────────────────────────────────────────────
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo " PULSE Pilot Release 1 — Database & Deployment complete"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo " Production Supabase : $SUPABASE_URL"
echo " Vercel project      : $VERCEL_PROJECT_ID"
echo " GitHub HEAD         : $(git rev-parse HEAD)"
echo ""
echo " NEXT STEP: Run acceptance tests"
echo "   Open https://pulse-os-web-wine.vercel.app"
echo "   Sign in with 1pulse.os@gmail.com (magic link)"
echo "   Work through workflows 1–18 in docs/PILOT_RELEASE_SCOPE.md"
echo "   Update docs/PRODUCTION_ACCEPTANCE_REPORT.md with results"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
