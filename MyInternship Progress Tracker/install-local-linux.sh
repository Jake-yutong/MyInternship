#!/usr/bin/env bash

set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
SERVICE_NAME="myinternship.service"
SERVICE_DIR="${XDG_CONFIG_HOME:-$HOME/.config}/systemd/user"
SERVICE_FILE="$SERVICE_DIR/$SERVICE_NAME"
DESKTOP_DIR="${XDG_DATA_HOME:-$HOME/.local/share}/applications"
DESKTOP_FILE="$DESKTOP_DIR/myinternship.desktop"
LAUNCHER_PATH="$PROJECT_DIR/open-local.sh"
NODE_PATH="$(command -v node || true)"
NPM_PATH="$(command -v npm || true)"

if [[ -z "$NODE_PATH" || -z "$NPM_PATH" ]]; then
  echo "需要先安装 Node.js 和 npm。"
  exit 1
fi

NODE_MAJOR="$($NODE_PATH -p "process.versions.node.split('.')[0]")"
if [[ "$NODE_MAJOR" -lt 24 ]]; then
  echo "当前 Node.js 版本过低，需要 24 或更高版本。"
  exit 1
fi

cd "$PROJECT_DIR"

if [[ ! -d node_modules ]]; then
  echo "首次安装，正在安装依赖..."
  "$NPM_PATH" install --no-package-lock
fi

echo "正在构建本地可运行版本..."
"$NPM_PATH" run build

mkdir -p "$SERVICE_DIR" "$DESKTOP_DIR"

cat > "$SERVICE_FILE" <<EOF
[Unit]
Description=MyInternship local service
After=default.target

[Service]
Type=simple
WorkingDirectory=$PROJECT_DIR
Environment=NODE_ENV=production
Environment=MYINTERNSHIP_API_HOST=127.0.0.1
Environment=MYINTERNSHIP_API_PORT=8787
ExecStart=$NODE_PATH $PROJECT_DIR/server/index.js
Restart=on-failure
RestartSec=3

[Install]
WantedBy=default.target
EOF

cat > "$DESKTOP_FILE" <<EOF
[Desktop Entry]
Version=1.0
Type=Application
Name=MyInternship
Comment=Open MyInternship locally
Exec=$LAUNCHER_PATH
Terminal=false
Categories=Office;Utility;
StartupNotify=true
EOF

chmod +x "$LAUNCHER_PATH"

if command -v systemctl >/dev/null 2>&1; then
  systemctl --user daemon-reload
  systemctl --user enable --now "$SERVICE_NAME"
  echo "已创建并启动 systemd 用户服务。"
else
  echo "未检测到 systemctl，将仅创建桌面启动器。"
fi

echo "安装完成。"
echo "以后可直接点击应用菜单中的 MyInternship，或运行："
echo "  cd '$PROJECT_DIR' && npm run open:local"