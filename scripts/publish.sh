#!/bin/bash
set -e

# Get version from root package.json
VERSION=$(bun -e "console.log(require('./package.json').version)")
echo "Publishing ts-charts v$VERSION"

echo ""
echo "=== Building all packages ==="
for dir in packages/*/; do
  if [ -f "$dir/build.ts" ]; then
    echo "Building $(basename $dir)..."
    (cd "$dir" && bun run build)
  fi
done

publish_package() {
  local dir=$1
  local pkg_json="$dir/package.json"

  if [ ! -f "$pkg_json" ]; then return; fi

  local is_private=$(bun -e "console.log(require('./$pkg_json').private === true)")
  if [ "$is_private" = "true" ]; then return; fi

  echo "Publishing $(basename $dir)..."

  # Backup
  cp "$pkg_json" "$pkg_json.bak"

  # Replace workspace:* deps with ^VERSION
  bun -e "
    const fs = require('fs');
    const pkg = JSON.parse(fs.readFileSync('$pkg_json', 'utf8'));
    for (const depType of ['dependencies', 'devDependencies', 'peerDependencies']) {
      if (!pkg[depType]) continue;
      for (const [name, ver] of Object.entries(pkg[depType])) {
        if (ver === 'workspace:*') pkg[depType][name] = '^$VERSION';
      }
    }
    fs.writeFileSync('$pkg_json', JSON.stringify(pkg, null, 2) + '\n');
  "

  (cd "$dir" && bun publish --access public) || true

  # Restore
  mv "$pkg_json.bak" "$pkg_json"
}

echo ""
echo "=== Publishing packages (dependency order) ==="

# Tier 1: No dependencies
publish_package "packages/internmap"
publish_package "packages/path"
publish_package "packages/format"
publish_package "packages/dispatch"
publish_package "packages/time"
publish_package "packages/timer"
publish_package "packages/ease"
publish_package "packages/random"
publish_package "packages/dsv"
publish_package "packages/polygon"
publish_package "packages/quadtree"
publish_package "packages/delaunator"

# Tier 2: Depend on tier 1
publish_package "packages/array"
publish_package "packages/interpolate"
publish_package "packages/time-format"
publish_package "packages/shape"
publish_package "packages/selection"
publish_package "packages/delaunay"

# Tier 3: Depend on tier 2
publish_package "packages/color"
publish_package "packages/scale"
publish_package "packages/scale-chromatic"

# Tier 4: Depend on tier 3
publish_package "packages/transition"
publish_package "packages/axis"
publish_package "packages/contour"
publish_package "packages/force"
publish_package "packages/geo"
publish_package "packages/hierarchy"

# Tier 5: Depend on tier 4
publish_package "packages/brush"
publish_package "packages/chord"
publish_package "packages/drag"
publish_package "packages/fetch"
publish_package "packages/zoom"

# Tier 6: Umbrella package (depends on everything)
publish_package "packages/ts-charts"

echo ""
echo "=== All packages published ==="
