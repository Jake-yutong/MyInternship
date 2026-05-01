#!/usr/bin/env bash

set -euo pipefail

INSTALL_DIR="${XDG_DATA_HOME:-$HOME/.local/share}/myinternship-desktop"
DESKTOP_DIR="${XDG_DATA_HOME:-$HOME/.local/share}/applications"
DESKTOP_FILE="$DESKTOP_DIR/myinternship-desktop.desktop"
APPIMAGE_TARGET="$INSTALL_DIR/MyInternship.AppImage"
DATA_DIR="${XDG_CONFIG_HOME:-$HOME/.config}/MyInternship/data"

rm -f "$APPIMAGE_TARGET" "$DESKTOP_FILE"
rmdir "$INSTALL_DIR" >/dev/null 2>&1 || true

if command -v update-desktop-database >/dev/null 2>&1; then
  update-desktop-database "$DESKTOP_DIR" >/dev/null 2>&1 || true
fi

echo "已移除桌面版 AppImage 和桌面启动器。"
echo "历史数据仍保留在: $DATA_DIR"