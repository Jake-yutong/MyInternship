#!/usr/bin/env bash

set -euo pipefail

SERVICE_NAME="myinternship.service"
SERVICE_DIR="${XDG_CONFIG_HOME:-$HOME/.config}/systemd/user"
SERVICE_FILE="$SERVICE_DIR/$SERVICE_NAME"
DESKTOP_DIR="${XDG_DATA_HOME:-$HOME/.local/share}/applications"
DESKTOP_FILE="$DESKTOP_DIR/myinternship.desktop"

if command -v systemctl >/dev/null 2>&1; then
  systemctl --user disable --now "$SERVICE_NAME" >/dev/null 2>&1 || true
  systemctl --user daemon-reload
fi

rm -f "$SERVICE_FILE" "$DESKTOP_FILE"

echo "已移除本地服务和桌面启动器。"
echo "SQLite 数据文件仍保留在 server/data/ 目录中。"