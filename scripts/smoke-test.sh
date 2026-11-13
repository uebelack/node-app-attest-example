#!/usr/bin/env bash
# Starts the example server in the given directory and checks that it answers.
set -euo pipefail

cd "$1"

# own process group, so stopping it also stops the node process pnpm starts
set -m
pnpm start >/dev/null 2>&1 &
server=$!
set +m
trap 'kill -- -"$server" 2>/dev/null || true' EXIT

for _ in $(seq 1 30); do
  curl -sf localhost:3000/v1/attest/challenge >/dev/null && break
  sleep 0.5
done

curl -sf localhost:3000/v1/attest/challenge | grep -q '"challenge"'

status=$(curl -s -o /dev/null -w '%{http_code}' -X POST -H 'content-type: application/json' -d '{}' localhost:3000/v1/send-message)
test "$status" = 401

echo "$1: ok"
