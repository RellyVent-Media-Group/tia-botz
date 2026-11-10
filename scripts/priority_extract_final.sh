#!/usr/bin/env bash
#
# priority_extract_final.sh - collect priority macOS forensic artifacts.
#
# Creates a timestamped directory under ~/Desktop/Forensic_Extract_YYYYMMDD_HHMMSS
# and updates ~/Desktop/Forensic_Extract to point at the newest run when possible.
#
# Usage:
#   bash scripts/priority_extract_final.sh [priority_extract.py options]
#
# Examples:
#   bash scripts/priority_extract_final.sh --help
#   bash scripts/priority_extract_final.sh --include-sensitive
#   bash scripts/priority_extract_final.sh --output-dir /tmp/forensic-test
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
EXTRACTOR="$ROOT_DIR/forensic/priority_extract.py"

if [ ! -f "$EXTRACTOR" ]; then
  echo "ERROR: extractor not found: $EXTRACTOR" >&2
  exit 2
fi

exec python3 "$EXTRACTOR" "$@"
