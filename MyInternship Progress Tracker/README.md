
# MyInternship Progress Tracker

MyInternship Progress Tracker 是“麦恩忒诗”应用的前后端一体目录。这个目录最初来源于 Figma 导出的前端代码包，现已扩展为一个可实际使用的本地化实习投递追踪工具。

原始设计链接：
https://www.figma.com/design/uMmWLsstRjQ8E3DrRprJ3Z/MyInternship-Progress-Tracker

## 可用链接

当前已经验证可用的链接如下：

- 仓库地址：https://github.com/Jake-yutong/MyInternship
- 本地前端开发地址：http://127.0.0.1:5173
- 本地单服务访问地址：http://127.0.0.1:8787
- 本地健康检查地址：http://127.0.0.1:8787/api/health

补充说明：

- 本地前端开发地址适用于 npm run start:local 或 npm run dev
- 本地单服务访问地址适用于 npm run build 后再运行 npm run start:server
- 当前还没有固定的公开线上域名；完成云端部署后，只需要把 127.0.0.1:8787 替换成正式域名

## 技术栈

- React 18
- Vite 6
- TypeScript
- Tailwind CSS 4
- Node.js 24+
- Express 本地 API

## 已实现功能

### 1. 投递记录管理

- 新增、编辑、删除投递卡片
- 字段覆盖公司、岗位、状态、日期、JD、备注、Logo 等信息
- 首次打开时若没有历史数据，会自动注入示例记录

### 2. 视图切换

- 左侧导航支持在卡片视图和甘特图视图间切换
- 甘特图会根据每条记录中的日期字段动态生成时间段展示

### 3. 本地持久化

- 默认优先写入本地 SQLite 数据库，而不是只依赖浏览器 localStorage
- 浏览器 localStorage 继续作为兜底缓存
- 存储结构使用稳定 key，而不是和版本强耦合的 key
- 存储内容包含 schemaVersion，支持后续迁移
- 同时写入备份 key，用于主数据异常时恢复
- 兼容旧 key 的历史数据读取与迁移

### 4. 本地后端

- 提供 /api/health 健康检查接口
- 提供 /api/applications 读写接口
- 使用 SQLite 落盘，并在数据库内保留 current/backup 两份快照
- 当前默认数据文件路径为 server/data/applications.sqlite
- 若检测到旧的 applications.json 或 applications.backup.json，会在首次读取时自动迁移到 SQLite

### 5. 智能输入增强

- 可从 JD 文本中提取公司、岗位等基础信息
- 可根据链接 hostname 推断公司来源
- 支持上传图片并转为 Base64 存储，方便纯前端本地使用

## 推荐启动方式

在当前目录执行：

```bash
npm run start:local
```

对应脚本位于 start-local.sh，它会：

- 自动检测 npm 是否可用
- 首次运行时自动安装依赖
- 以 127.0.0.1:5173 启动 Vite 开发服务器
- 以 127.0.0.1:8787 启动本地 API 服务

推荐固定使用这个地址，是因为 localStorage 按“协议 + 域名 + 端口”隔离。开发时如果端口频繁变化，会导致你看到的是另一份本地存储。

启动后访问：

```text
http://127.0.0.1:5173
```

构建完成后如果使用单服务模式，也可以直接访问：

```text
http://127.0.0.1:8787
```

后端健康检查：

```text
http://127.0.0.1:8787/api/health
```

## 推荐的个人本地使用方式

如果你暂时不打算给别人用，只想自己在本机“一键打开直接用”，推荐走下面这条路线：

1. 第一次安装时执行 npm run install:local:linux
2. 它会完成依赖安装、前端构建、本地服务注册和桌面启动器创建
3. 以后只需要点击桌面应用菜单里的 MyInternship，或者执行 npm run open:local

这样你就不需要每次再手动运行开发服务器或启动脚本。

相关脚本：

- npm run install:local:linux: 一次性安装本地服务和桌面启动器
- npm run open:local: 自动确保服务运行并打开浏览器
- npm run uninstall:local:linux: 移除本地服务和桌面启动器

## 桌面应用模式

如果你希望它成为真正的桌面程序，而不是启动浏览器页面，当前项目已经接入 Electron 桌面壳。

可用命令：

- npm run desktop:start: 构建后直接启动桌面应用
- npm run desktop:pack: 生成未打包桌面产物，输出到 release/linux-unpacked
- npm run desktop:dist: 生成 Linux AppImage
- npm run desktop:install:linux: 将 AppImage 安装到当前用户目录并创建桌面启动器
- npm run desktop:install:release:linux: 直接从 GitHub 最新 Release 下载并安装 Linux 桌面版
- npm run desktop:open: 优先打开已安装桌面版，没有时自动安装或直接运行 release 下的 AppImage
- npm run desktop:uninstall:linux: 移除桌面版 AppImage 和桌面启动器

桌面模式下：

- Electron 主进程会自动拉起本地 Express 服务
- 前端页面会直接显示在桌面窗口里
- SQLite 数据目录会切换到系统用户数据目录，不再依赖仓库里的 server/data

这意味着你可以把它当作一个真正的本地应用来打开和分发。

桌面模式下的数据不会因为关闭应用而清空。当前 Linux 桌面版会把 SQLite 数据固定保存到：

```text
~/.config/MyInternship/data/applications.sqlite
```

只要你没有手动删除这个目录，或者代码里没有主动清库，下次打开桌面应用时会继续读取这份数据。卸载桌面启动器和 AppImage 也不会删除这里的历史数据。

### Linux 桌面安装

如果你已经确认要以 Electron 桌面程序的形式长期使用，推荐直接执行：

```bash
npm run desktop:install:linux
```

它会自动完成下面这些动作：

- 若 release/ 下还没有 AppImage，则先执行桌面打包
- 把 AppImage 复制到当前用户目录下的稳定安装路径
- 创建应用菜单可见的桌面启动器

安装后可以直接执行：

```bash
npm run desktop:open
```

如果你是分发给别人使用，而不是在本仓库本地安装，可以直接提供最新 Release 页面链接：

```text
https://github.com/Jake-yutong/MyInternship/releases/latest
```

或者让对方执行下面这条命令，直接从 GitHub 最新 Release 下载并安装：

```bash
bash <(curl -fsSL https://raw.githubusercontent.com/Jake-yutong/MyInternship/main/MyInternship%20Progress%20Tracker/install-desktop-linux-from-release.sh)
```

补充说明：

- 在 Linux 浏览器环境下，普通网页链接通常只能触发下载，不能像应用商店那样无提示静默安装
- 当前最接近“点链接就安装”的可行方案，是把最新版 AppImage 挂到 GitHub Release，再提供下载链接或一条自动安装命令

卸载时执行：

```bash
npm run desktop:uninstall:linux
```

## 手动命令

```bash
npm install
npm run dev
npm run dev:server
npm run start:server
npm run build
```

## 可用脚本

- npm run dev: 启动 Vite 开发服务器
- npm run desktop:start: 启动桌面应用
- npm run desktop:open: 打开已安装桌面版，或回退到 release 下的 AppImage
- npm run desktop:pack: 生成未打包桌面产物
- npm run desktop:dist: 生成 Linux AppImage
- npm run desktop:install:linux: 安装 Linux 桌面版并创建菜单启动器
- npm run desktop:install:release:linux: 从 GitHub 最新 Release 下载并安装 Linux 桌面版
- npm run desktop:uninstall:linux: 卸载 Linux 桌面版和菜单启动器
- npm run dev:server: 启动本地后端 API
- npm run install:local:linux: 一次性安装 Linux 本地服务和桌面启动器
- npm run open:local: 打开本地应用，必要时自动拉起服务
- npm run start:server: 启动本地后端 API
- npm run build: 生成生产构建
- npm run start:local: 一键本地启动，同时拉起前后端并固定地址
- npm run uninstall:local:linux: 卸载 Linux 本地服务和桌面启动器

## 运行前提

- Node.js 24 或更高版本
- 后端依赖 Node 内置的 node:sqlite 模块

## 在线部署

当前项目已经支持“单服务同源部署”：

- 后端 API 仍由 Express 提供
- 执行 npm run build 后，Express 会额外把 dist 里的前端页面一并对外提供
- 对外只需要一个网址，例如 https://your-domain.example
- 页面和 /api 走同一个域名，前端不需要额外改接口路径

这意味着你可以保留现在的后端思路，并把它部署成真正可访问的在线版本。

### 推荐部署形态

推荐使用支持持久磁盘的 Node 容器平台：

- VPS + Docker
- Fly.io + volume
- Render Web Service + Disk
- Railway + persistent volume

不推荐：

- GitHub Pages
- 纯静态 Vercel/Netlify 部署
- 没有持久磁盘的无状态 serverless 方案

### 容器部署

目录内已提供 Dockerfile 和 .dockerignore。

基础流程：

1. 构建镜像
2. 运行容器并暴露 8787 端口
3. 把 server/data 挂载到持久卷

示例：

```bash
docker build -t myinternship .
docker run -d \
  -p 8787:8787 \
  -v myinternship-data:/app/server/data \
  --name myinternship \
  myinternship
```

启动后访问：

```text
http://your-server:8787
```

健康检查：

```text
http://your-server:8787/api/health
```

### 部署注意点

- 当前后端默认会监听环境变量 MYINTERNSHIP_API_HOST 和 MYINTERNSHIP_API_PORT
- 容器内默认已经设置为 0.0.0.0:8787
- SQLite 数据文件位于 server/data/applications.sqlite
- 如果历史上有 applications.json，服务首次启动时会自动迁移进 SQLite

## 数据持久化说明

当前实现是“纯本地、单用户、本机文件持久化 + 浏览器缓存兜底”模型：

- 数据默认写入当前机器上的后端文件
- 数据主存储现在是 SQLite，不再依赖 JSON 文件整包重写
- 浏览器 localStorage 只作为前端缓存与后端不可用时的回退方案
- 没有账号系统、云同步、多人协作或服务端数据库
- 浏览器缓存清理、切换浏览器、切换设备后不会自动同步

如果后续要增强数据可迁移性，建议下一步补充：

- JSON 导出
- JSON 导入
- 手动备份与恢复入口

## 目录概览

```text
src/
  app/
    App.tsx                主状态与页面调度
    api.ts                 前端到本地后端的 API 请求封装
    data.ts                应用数据模型、状态配置、迁移与存储解析
    hooks/
      useLocalStorage.ts   本地存储 Hook
    components/
      CardView.tsx         卡片视图
      GanttView.tsx        甘特图视图
      SlideOutPanel.tsx    新增/编辑面板
      DeleteModal.tsx      删除确认弹窗
server/
  index.js                本地 Express API 入口
  storage.js              SQLite 存储、备份快照与 JSON 迁移逻辑
  data/                   运行时数据目录
```

## 适用场景

这个项目更适合：

- 个人本地记录求职进度
- 不依赖后端快速使用
- 后续继续迭代前端体验和数据模型

当前不适合：

- 多人协作
- 跨设备自动同步
- 需要服务端权限控制的场景
  