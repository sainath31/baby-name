#!/bin/sh
# Downloads upstream source texts into .cache/ (not committed).
set -e
mkdir -p "$(dirname "$0")/../.cache"
curl -fsSL -o "$(dirname "$0")/../.cache/mw.txt" \
  https://raw.githubusercontent.com/sanskrit-lexicon/csl-orig/master/v02/mw/mw.txt
