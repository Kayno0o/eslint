#!/bin/bash

rm -rf dist
mkdir -p dist

for file in ./src/*.ts; do
  filename=$(basename "${file%.ts}")
  outfile="dist/${filename}.js"

  bun build "$file" \
    --target node \
    --packages external \
    --minify \
    > "$outfile"
done
