#!/bin/bash
# Applies the initial schema to Supabase using the Management API.
# Usage: SUPABASE_ACCESS_TOKEN=sbp_... PROJECT_REF=abcxyz ./scripts/apply-schema.sh

set -e

TOKEN="${SUPABASE_ACCESS_TOKEN:-$1}"
REF="${PROJECT_REF:-$2}"

if [[ -z "$TOKEN" || -z "$REF" ]]; then
  echo "Usage: SUPABASE_ACCESS_TOKEN=<token> PROJECT_REF=<ref> $0"
  echo "  OR: $0 <token> <ref>"
  echo ""
  echo "Find your project ref in: https://supabase.com/dashboard/project/_/settings/general"
  exit 1
fi

SQL=$(cat "$(dirname "$0")/../supabase/migrations/001_initial_schema.sql")

echo "Applying schema to project: $REF ..."
curl -s -X POST \
  "https://api.supabase.com/v1/projects/${REF}/database/query" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{\"query\": $(echo "$SQL" | jq -Rs .)}" \
  | jq .

echo "Done."
