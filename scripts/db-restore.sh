#!/usr/bin/env bash
# Restore the local Postgres container from a dump in ./backups.
#
#   npm run db:restore              # restore the most recent dump
#   npm run db:restore -- FILE.sql  # restore a specific one
#
# This REPLACES the current contents of the database. It asks first.
set -euo pipefail

CONTAINER="${DB_CONTAINER:-edu-platform-db}"
DB_USER="${DB_USER:-edu}"
DB_NAME="${DB_NAME:-edu_platform}"
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/backups"

FILE="${1:-}"
if [ -z "$FILE" ]; then
  FILE="$(ls -1t "$DIR"/${DB_NAME}-*.sql 2>/dev/null | head -1 || true)"
fi
if [ -z "$FILE" ] || [ ! -f "$FILE" ]; then
  echo "No backup file found. Looked in $DIR" >&2
  exit 1
fi

if ! docker ps --format '{{.Names}}' | grep -qx "$CONTAINER"; then
  echo "Container '$CONTAINER' is not running. Start it with: docker start $CONTAINER" >&2
  exit 1
fi

echo "About to REPLACE the contents of '$DB_NAME' with:"
echo "  $FILE"
read -r -p "Type yes to continue: " reply
[ "$reply" = "yes" ] || { echo "Cancelled."; exit 1; }

docker exec -i "$CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -v ON_ERROR_STOP=1 < "$FILE"
echo "Restored from $(basename "$FILE")"
