#!/usr/bin/env bash

set -euo pipefail

REPO_OWNER="Jake-yutong"
REPO_NAME="MyInternship"
INSTALL_DIR="${XDG_DATA_HOME:-$HOME/.local/share}/myinternship-desktop"
DESKTOP_DIR="${XDG_DATA_HOME:-$HOME/.local/share}/applications"
DESKTOP_FILE="$DESKTOP_DIR/myinternship-desktop.desktop"
APPIMAGE_TARGET="$INSTALL_DIR/MyInternship.AppImage"
ICON_TARGET="$INSTALL_DIR/logo.png"
DATA_DIR="${XDG_CONFIG_HOME:-$HOME/.config}/MyInternship/data"
LATEST_RELEASE_API="https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/releases/latest"
RAW_ICON_URL="https://raw.githubusercontent.com/$REPO_OWNER/$REPO_NAME/main/MyInternship%20Progress%20Tracker/public/logo.png"
TEMP_DIR="$(mktemp -d)"
TEMP_APPIMAGE="$TEMP_DIR/MyInternship.AppImage"
TEMP_ICON="$TEMP_DIR/logo.png"

cleanup() {
  rm -rf "$TEMP_DIR"
}

trap cleanup EXIT

fetch_release_metadata() {
  if command -v curl >/dev/null 2>&1; then
    curl -fsSL "$LATEST_RELEASE_API"
    return
  fi

  if command -v wget >/dev/null 2>&1; then
    wget -qO- "$LATEST_RELEASE_API"
    return
  fi

  echo "需要 curl 或 wget 才能下载最新桌面版。"
  exit 1
}

download_file() {
  local url="$1"
  local destination="$2"

  if command -v curl >/dev/null 2>&1; then
    curl -fL "$url" -o "$destination"
    return
  fi

  wget -O "$destination" "$url"
}

RELEASE_METADATA="$(fetch_release_metadata)"
APPIMAGE_URL="$(printf '%s\n' "$RELEASE_METADATA" | grep -o '"browser_download_url": *"[^"]*\.AppImage"' | head -n 1 | sed 's/.*"browser_download_url": *"\([^"]*\)"/\1/')"
ICON_URL="$(printf '%s\n' "$RELEASE_METADATA" | grep -o '"browser_download_url": *"[^"]*/logo\.png"' | head -n 1 | sed 's/.*"browser_download_url": *"\([^"]*\)"/\1/')"

if [[ -z "$APPIMAGE_URL" ]]; then
  echo "未能从 GitHub Release 找到 AppImage 下载地址。"
  exit 1
fi

if [[ -z "$ICON_URL" ]]; then
  ICON_URL="$RAW_ICON_URL"
fi

echo "正在下载最新桌面版..."
download_file "$APPIMAGE_URL" "$TEMP_APPIMAGE"
download_file "$ICON_URL" "$TEMP_ICON"

mkdir -p "$INSTALL_DIR" "$DESKTOP_DIR"
cp "$TEMP_APPIMAGE" "$APPIMAGE_TARGET"
cp "$TEMP_ICON" "$ICON_TARGET"
chmod +x "$APPIMAGE_TARGET"

cat > "$DESKTOP_FILE" <<EOF
[Desktop Entry]
Version=1.0
Type=Application
Name=MyInternship
Comment=Track internship applications in a local desktop app
Exec=$APPIMAGE_TARGET
TryExec=$APPIMAGE_TARGET
Icon=$ICON_TARGET
Terminal=false
Categories=Office;Utility;
StartupNotify=true
EOF

if command -v update-desktop-database >/dev/null 2>&1; then
  update-desktop-database "$DESKTOP_DIR" >/dev/null 2>&1 || true
fi

echo "最新桌面版安装完成。"
echo "AppImage 已安装到: $APPIMAGE_TARGET"
echo "桌面启动器已写入: $DESKTOP_FILE"
echo "桌面数据会持久保存在: $DATA_DIR"