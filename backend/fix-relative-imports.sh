#!/usr/bin/env bash
# fix_imports.sh
# Adds ".js" to relative imports in JS files that don't already have it.

set -euo pipefail

SRC_DIR="src"

echo "🔍 Scanning JS files in $SRC_DIR for relative imports missing .js..."

# Find all .js files under src
find "$SRC_DIR" -type f -name "*.js" | while read -r file; do
  tmp_file=$(mktemp)

  # Fix relative imports (import x from './file' and import('./file'))
  sed -E 's|\b(from|import)\s*([\"\'])((\.{1,2})/[^\"\']*?)(\2)|\1 \2\3.js\5|g' "$file" > "$tmp_file"

  if ! cmp -s "$file" "$tmp_file"; then
    echo "✅ Fixed imports in: $file"
    mv "$tmp_file" "$file"
  else
    rm "$tmp_file"
  fi
done

echo "✨ All done! Relative imports now have .js suffixes where missing."
