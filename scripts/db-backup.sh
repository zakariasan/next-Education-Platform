#!/usr/bin/env bash
# Snapshot the local Postgres container into ./backups, newest last.
# Run it before any schema change. Keeps the last 20 dumps.
set -euo pipefail

CONTAINER="${DB_CONTAINER:-edu-platform-db}"
DB_USER="${DB_USER:-edu}"
DB_NAME="${DB_NAME:-edu_platform}"
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/backups"

mkdir -p "$DIR"
STAMP="$(date +%Y%m%d-%H%M%S)"
OUT="$DIR/${DB_NAME}-${STAMP}.sql"

if ! docker ps --format '{{.Names}}' | grep -qx "$CONTAINER"; then
  echo "Container '$CONTAINER' is not running. Start it with: docker start $CONTAINER" >&2
  exit 1
fi

docker exec "$CONTAINER" pg_dump -U "$DB_USER" -d "$DB_NAME" --clean --if-exists > "$OUT"
echo "Wrote $OUT ($(du -h "$OUT" | cut -f1))"

# Prune everything but the 20 most recent dumps.
ls -1t "$DIR"/${DB_NAME}-*.sql 2>/dev/null | tail -n +21 | while read -r old; do
  rm -f "$old"
  echo "Pruned old backup: $(basename "$old")"
done
