#!/bin/bash
# Deploy the Pesty Agent Skills catalog page to Cloudways (Pesty-internal;
# needs ~/.pesty-deploy.env + ~/.cloudways_ssh_password, neither in this repo).
# Usage: ./deploy.sh   (run build.py first so dist/index.html is fresh)

set -euo pipefail

ENV_FILE="$HOME/.pesty-deploy.env"
if [ ! -f "$ENV_FILE" ]; then
  echo "Missing $ENV_FILE (defines PESTY_DEPLOY_SERVER + PESTY_DEPLOY_APP_ROOT)."
  exit 1
fi
# shellcheck source=/dev/null
source "$ENV_FILE"

SERVER="$PESTY_DEPLOY_SERVER"
REMOTE_DIR="$PESTY_DEPLOY_APP_ROOT/agent-skills"
LOCAL_DIR="dist"
PASSWORD_FILE="$HOME/.cloudways_ssh_password"

cd "$(dirname "$0")"

if [ ! -f "$LOCAL_DIR/index.html" ]; then
  echo "Missing $LOCAL_DIR/index.html. Run build.py first."
  exit 1
fi
if [ ! -f "$PASSWORD_FILE" ]; then
  echo "Missing $PASSWORD_FILE."
  exit 1
fi

PASSWORD=$(cat "$PASSWORD_FILE")

expect -c "
  set timeout -1
  spawn ssh $SERVER \"mkdir -p $REMOTE_DIR\"
  expect \"password:\"
  send \"$PASSWORD\r\"
  expect eof
" > /dev/null

expect -c "
  set timeout -1
  spawn rsync -az --delete -e ssh $LOCAL_DIR/ $SERVER:$REMOTE_DIR/
  expect \"password:\"
  send \"$PASSWORD\r\"
  expect eof
"

expect -c "
  spawn ssh $SERVER
  expect \"password:\"
  send \"$PASSWORD\r\"
  expect \"\\\$\"
  send \"curl -s -X PURGE -H 'Host: pestymarketing.com' -o /dev/null http://127.0.0.1/PURGEALL\r\"
  expect \"\\\$\"
  send \"exit\r\"
  expect eof
" > /dev/null 2>&1 || true

echo "Verifying live URL..."
URL="https://pestymarketing.com/agent-skills/"
ok=0
for attempt in 1 2 3 4 5 6; do
  code=$(curl -s -o /dev/null -w '%{http_code}' -A 'Mozilla/5.0' "$URL")
  echo "  attempt $attempt: $code"
  [ "$code" = "200" ] && { ok=1; break; }
  sleep 10
done
[ "$ok" = "1" ] || { echo "ERROR: $URL never returned 200"; exit 1; }

echo "Deployed to $URL"
