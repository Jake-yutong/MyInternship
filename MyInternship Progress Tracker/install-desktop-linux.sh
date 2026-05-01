#!/usr/bin/env bash

set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
RELEASE_DIR="$PROJECT_DIR/release"
INSTALL_DIR="${XDG_DATA_HOME:-$HOME/.local/share}/myinternship-desktop"
DESKTOP_DIR="${XDG_DATA_HOME:-$HOME/.local/share}/applications"
DESKTOP_FILE="$DESKTOP_DIR/myinternship-desktop.desktop"
APPIMAGE_TARGET="$INSTALL_DIR/MyInternship.AppImage"
ICON_SOURCE="$PROJECT_DIR/public/logo.png"
ICON_TARGET="$INSTALL_DIR/logo.png"
DATA_DIR="${XDG_CONFIG_HOME:-$HOME/.config}/MyInternship/data"
NPM_PATH="$(command -v npm || true)"

find_latest_appimage() {
  find "$RELEASE_DIR" -maxdepth 1 -type f \( -name 'MyInternship.AppImage' -o -name 'MyInternship-*.AppImage' \) -printf '%T@ %p\n' 2>/dev/null \
    | sort -nr \
    | head -n 1 \
    | cut -d' ' -f2-
}

ensure_release_appimage() {
  local release_appimage=""

  if [[ -n "${MYINTERNSHIP_APPIMAGE_SOURCE:-}" ]]; then
    if [[ ! -f "${MYINTERNSHIP_APPIMAGE_SOURCE}" ]]; then
      echo "指定的 AppImage 文件不存在: ${MYINTERNSHIP_APPIMAGE_SOURCE}"
      exit 1
    fi

    printf '%s\n' "${MYINTERNSHIP_APPIMAGE_SOURCE}"
    return
  fi

  release_appimage="$(find_latest_appimage)"
  if [[ -n "$release_appimage" ]]; then
    printf '%s\n' "$release_appimage"
    return
  fi

  if [[ -z "$NPM_PATH" ]]; then
    echo "未找到 npm，且 release/ 下没有可安装的 AppImage。"
    exit 1
  fi

  cd "$PROJECT_DIR"
  echo "未找到 AppImage，正在构建桌面发行包..."
  "$NPM_PATH" run desktop:dist

  release_appimage="$(find_latest_appimage)"
  if [[ -z "$release_appimage" ]]; then
    echo "桌面发行包构建完成后仍未找到 AppImage。"
    exit 1
  fi

  printf '%s\n' "$release_appimage"
}

SOURCE_APPIMAGE="$(ensure_release_appimage)"

mkdir -p "$INSTALL_DIR" "$DESKTOP_DIR"
cp "$SOURCE_APPIMAGE" "$APPIMAGE_TARGET"
cp "$ICON_SOURCE" "$ICON_TARGET"
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

echo "桌面版安装完成。"
echo "AppImage 已安装到: $APPIMAGE_TARGET"
echo "桌面启动器已写入: $DESKTOP_FILE"
echo "桌面数据会持久保存在: $DATA_DIR"
echo "可直接在应用菜单中搜索 MyInternship，或运行："
echo "  cd '$PROJECT_DIR' && npm run desktop:open"