#!/bin/bash
set -e
export ROLLUP_NO_NATIVE=1
export ROLLUP_NO_WASM=1
npm run build