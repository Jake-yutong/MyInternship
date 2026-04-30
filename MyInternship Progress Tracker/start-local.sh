#!/usr/bin/env bash

set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
HOST="127.0.0.1"
PORT="5173"
API_HOST="127.0.0.1"
API_PORT="8787"
API_PID=""

cd "$PROJECT_DIR"

if ! command -v npm >/dev/null 2>&1; then
  echo "npm 未安装，无法启动项目。"
  exit 1
fi

if [[ ! -d node_modules ]]; then
  echo "首次启动，正在安装依赖..."
  npm install --no-package-lock
fi

cleanup() {
  if [[ -n "$API_PID" ]] && kill -0 "$API_PID" >/dev/null 2>&1; then
    kill "$API_PID" >/dev/null 2>&1 || true
  fi
}

trap cleanup EXIT INT TERM

echo "MyInternship 正在启动..."
echo "本地地址: http://$HOST:$PORT"
echo "后端地址: http://$API_HOST:$API_PORT"

MYINTERNSHIP_API_HOST="$API_HOST" MYINTERNSHIP_API_PORT="$API_PORT" npm run dev:server &
API_PID=$!

npm run dev -- --host "$HOST" --port "$PORT"