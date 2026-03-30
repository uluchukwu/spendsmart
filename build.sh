#!/usr/bin/env bash
set -e   # stop immediately if any command fails

echo "==> Installing client dependencies..."
cd client
npm install --include=dev

echo "==> Building React app..."
npm run build

echo "==> Installing server dependencies..."
cd ../server
npm install

echo "==> Build complete."
