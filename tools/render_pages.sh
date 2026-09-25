#!/usr/bin/env bash
# Re-renders the step 5 page images from public/assets/form.pdf (needs poppler's pdftoppm).
# Run after replacing the form with a new version from Council.
set -euo pipefail
cd "$(dirname "$0")/../public/assets"
pdftoppm -r 144 -png form.pdf pages/page
# pdftoppm names files page-1.png, page-2.png (or page-01.png for 10+ pages)
ls pages
