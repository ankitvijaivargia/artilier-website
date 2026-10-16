#!/usr/bin/env bash
# Release gate — run on the branch about to be merged, on the day of release.
#   bash tools/release_check.sh
# Fails if: the privacy notice date is not today's date (India time), any build
# fails, check.py reports an error, or the rebuild changes committed files.
set -euo pipefail
cd "$(dirname "$0")/.."
today=$(TZ=Asia/Kolkata date +'%-d %B %Y')
stated=$(grep -oP "const PRIVACY_PUBLISHED = '\K[^']+" tools/build3.mjs || true)
if [ -n "$stated" ] && [ "$stated" != "$today" ]; then
  echo "BLOCK: privacy notice says '$stated' but today is '$today'. Update PRIVACY_PUBLISHED in tools/build3.mjs, rebuild, commit." >&2; exit 1
fi
python3 tools/images.py --check
node tools/build.mjs >/dev/null && node tools/build2.mjs >/dev/null && node tools/build3.mjs >/dev/null
python3 tools/check.py | tail -3
rm -rf tools/__pycache__
if [ -n "$(git status --porcelain)" ]; then echo "BLOCK: rebuild changed committed files:" >&2; git status --porcelain >&2; exit 1; fi
echo "RELEASE GATE: PASS (privacy date '$stated', builds, checks, clean tree)"
