#!/bin/bash
# Auto-génère articles/index.json à partir des .md trouvés dans articles/
# Tri par date desc — c'est cet ordre qui sert pour la nav prev/next.
set -euo pipefail
cd "$(dirname "$0")"

# Extraction (slug, date) pour chaque .md
declare -a entries
for f in articles/*.md; do
  [ -f "$f" ] || continue
  slug="${f#articles/}"
  slug="${slug%.md}"
  # Skip the index.json itself if someone names a file index.md
  [ "$slug" = "index" ] && continue
  date=$(grep -m1 '^date:' "$f" | sed 's/^date:[[:space:]]*//' | tr -d '"' || true)
  entries+=("${date}|${slug}")
done

# Tri par date desc (plus récent en premier)
IFS=$'\n' sorted=($(printf '%s\n' "${entries[@]}" | sort -t'|' -k1 -r))
unset IFS

# Écriture de index.json
{
  echo "["
  first=1
  for entry in "${sorted[@]}"; do
    slug="${entry#*|}"
    if [ $first -eq 1 ]; then
      first=0
    else
      echo ","
    fi
    printf '  "%s"' "$slug"
  done
  echo ""
  echo "]"
} > articles/index.json

echo "✅ index.json regénéré (${#sorted[@]} articles)"
