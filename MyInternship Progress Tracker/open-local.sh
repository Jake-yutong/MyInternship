#!/usr/bin/env bash

set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
SERVICE_NAME="myinternship.service"
APP_URL="http://127.0.0.1:8787"
HEALTH_URL="$APP_URL/api/health"
NODE_PATH="$(command -v node || true)"
NPM_PATH="$(command -v npm || true)"
LOG_FILE="${XDG_STATE_HOME:-$HOME/.local/state}/myinternship/open-local.log"

mkdir -p "$(dirname "$LOG_FILE")"

probe_health() {
  if command -v curl >/dev/null 2>&1; then
    curl -fsS --max-time 2 "$HEALTH_URL" >/dev/null 2>&1
    return
  fi

  if command -v wget >/dev/null 2>&1; then
    wget -q -T 2 -O /dev/null "$HEALTH_URL" >/dev/null 2>&1
    return
  fi

  return 1
}

open_browser() {
  if command -v xdg-open >/dev/null 2>&1; then
    xdg-open "$APP_URL" >/dev/null 2>&1 &
    return
  fi

  if command -v gio >/dev/null 2>&1; then
    gio open "$APP_URL" >/dev/null 2>&1 &
    return
  fi

  echo "服务已启动，请手动打开：$APP_URL"
}

ensure_build_ready() {
  cd "$PROJECT_DIR"

  if [[ -z "$NPM_PATH" || -z "$NODE_PATH" ]]; then
    echo "缺少 Node.js 或 npm，无法自动启动 MyInternship。"
    exit 1
  fi

  if [[ ! -d node_modules ]]; then
    "$NPM_PATH" install --no-package-lock
  fi

  if [[ ! -f dist/index.html ]]; then
    "$NPM_PATH" run build
  fi
}

start_service() {
  if command -v systemctl >/dev/null 2>&1; then
    systemctl --user start "$SERVICE_NAME" >/dev/null 2>&1 || true
    return
  fi

  ensure_build_ready
  nohup env NODE_ENV=production MYINTERNSHIP_API_HOST=127.0.0.1 MYINTERNSHIP_API_PORT=8787 "$NODE_PATH" "$PROJECT_DIR/server/index.js" >> "$LOG_FILE" 2>&1 &
}

if ! probe_health; then
  start_service

  for _ in $(seq 1 40); do
    if probe_health; then
      break
    fi
    sleep 0.5
  done
fi

if ! probe_health; then
  echo "MyInternship 启动失败，请先执行安装：npm run install:local:linux"
  exit 1
fi

open_browser