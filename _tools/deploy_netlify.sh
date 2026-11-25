#!/bin/bash
# Upload laman ke Netlify (teamshahmahpob.netlify.app). Guna: bash _tools/deploy_netlify.sh
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"; TMP="$(mktemp -d)"
rsync -a --exclude .git --exclude _tools --exclude .claude --exclude .DS_Store "$ROOT/" "$TMP/"
# Bot WhatsApp (Netlify Functions di /api/*). Kod di luar folder awam, jadi tak terdedah sebagai fail statik.
BOT="$ROOT/_tools/whatsapp-bot"
(cd "$BOT" && npm ci --omit=dev --no-audit --no-fund)
cd "$TMP" && npx -y netlify-cli@27.14.2 deploy --prod --dir . --functions "$BOT/functions" --site 8a510cde-842c-4495-911d-58520c0829a5 --message "update $(date +%F)"
