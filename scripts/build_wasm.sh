#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
WASM_DIR="${ROOT_DIR}/wasm"
FRONTEND_PKG_DIR="${ROOT_DIR}/frontend/src/lib/ats-engine/pkg"

echo "🦀 Building ResumeLint ATS WebAssembly module..."
cd "${WASM_DIR}"

# Ensure wasm target exists
rustup target add wasm32-unknown-unknown 2>/dev/null || true

# Build with wasm-pack
wasm-pack build --target web --out-dir pkg

# Also sync pkg to frontend ats-engine directory
mkdir -p "${FRONTEND_PKG_DIR}"
cp -r "${WASM_DIR}/pkg/"* "${FRONTEND_PKG_DIR}/"

echo "✅ WASM module built and synced to frontend!"
