#!/usr/bin/env bash

set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
RELEASE_DIR="$PROJECT_DIR/release"
INSTALLED_APPIMAGE="${XDG_DATA_HOME:-$HOME/.local/share}/myinternship-desktop/MyInternship.AppImage"
NPM_PATH="$(command -v npm || true)"

find_latest_appimage() {
  find "$RELEASE_DIR" -maxdepth 1 -type f \( -name 'MyInternship.AppImage' -o -name 'MyInternship-*.AppImage' \) -printf '%T@ %p\n' 2>/dev/null \
    | sort -nr \
    | head -n 1 \
    | cut -d' ' -f2-
}

launch_appimage() {
  local appimage_path="$1"
  chmod +x "$appimage_path"
  exec "$appimage_path"
}

if [[ -f "$INSTALLED_APPIMAGE" ]]; then
  launch_appimage "$INSTALLED_APPIMAGE"
fi

RELEASE_APPIMAGE="$(find_latest_appimage)"
if [[ -n "$RELEASE_APPIMAGE" ]]; then
  launch_appimage "$RELEASE_APPIMAGE"
fi

if [[ -z "$NPM_PATH" ]]; then
  echo "未找到已安装的桌面版，也无法自动构建 AppImage。"
  echo "请先执行 npm run desktop:install:linux"
  exit 1
fi

cd "$PROJECT_DIR"
"$NPM_PATH" run desktop:install:linux

if [[ ! -f "$INSTALLED_APPIMAGE" ]]; then
  echo "桌面版安装后仍未找到 AppImage。"
  exit 1
fi

launch_appimage "$INSTALLED_APPIMAGE"