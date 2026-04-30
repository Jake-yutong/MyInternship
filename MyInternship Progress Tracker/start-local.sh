#!/usr/bin/env bash

set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
HOST="127.0.0.1"
PORT="5173"

cd "$PROJECT_DIR"

if ! command -v npm >/dev/null 2>&1; then
  echo "npm 未安装，无法启动项目。"
  exit 1
fi

if [[ ! -d node_modules ]]; then
  echo "首次启动，正在安装依赖..."
  npm install --no-package-lock
fi

echo "MyInternship 正在启动..."
echo "本地地址: http://$HOST:$PORT"

exec npm run dev -- --host "$HOST" --port "$PORT"