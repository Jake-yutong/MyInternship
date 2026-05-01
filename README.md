# MyInternship

MyInternship，中文名“麦恩忒诗”，是一个以本地优先为核心的个人实习投递追踪应用。当前版本基于 React + Vite，并新增了一个本地后端服务：前端负责交互与展示，后端负责把投递记录写入本机 SQLite 数据库，减少因为浏览器缓存清理、切换配置或 localStorage 异常带来的数据丢失风险。

## 当前能力

- 卡片视图管理投递记录，支持新增、编辑、删除
- 甘特图视图按阶段日期展示投递时间线
- 默认启用本地后端持久化，数据写入本机 SQLite 文件
- 浏览器 localStorage 仍保留为兜底缓存，后端不可用时不会立刻不可用
- 存储结构带版本号、迁移逻辑和备份 key，后续版本迭代时尽量避免数据丢失
- 支持从 JD 文本或链接中提取公司、岗位等基础信息
- 支持上传 Logo，并以 Base64 形式保存在本地

## 项目位置

实际前端应用位于目录：MyInternship Progress Tracker

## 可用链接

当前已经确认可用的链接如下：

- 仓库地址：https://github.com/Jake-yutong/MyInternship
- 最新 Linux 桌面版下载：https://github.com/Jake-yutong/MyInternship/releases/latest/download/MyInternship.AppImage
- 最新桌面版发布页：https://github.com/Jake-yutong/MyInternship/releases/latest
- 本地前端开发地址：http://127.0.0.1:5173
- 本地单服务访问地址：http://127.0.0.1:8787
- 本地健康检查地址：http://127.0.0.1:8787/api/health

说明：

- GitHub Pages 已启用，网页版公开地址：https://jake-yutong.github.io/MyInternship/
- 网页版运行在浏览器本地缓存模式，不依赖本地 Node/SQLite 服务，直接点链接即可使用
- Linux 桌面版下载链接指向仓库最新 Release，首次发版完成后可直接点击下载 AppImage
- 上述 127.0.0.1 链接是在本机启动项目后可直接访问的有效地址
- 当前仓库已经支持单服务同源部署，但还没有固定的公开线上域名
- 完成云端部署后，只需要把 http://127.0.0.1:8787 替换成你的正式域名即可

## 本地启动

进入应用目录后可直接使用一键启动脚本：

```bash
cd "MyInternship Progress Tracker"
npm run start:local
```

这个命令会：

- 在首次启动时自动安装依赖
- 固定以 127.0.0.1:5173 启动前端开发服务器
- 同时以 127.0.0.1:8787 启动本地后端 API
- 尽量保持 localStorage 的同源地址稳定，避免因为开发地址变化导致“看起来像丢数据”

启动后访问：

```text
http://127.0.0.1:5173
```

如果使用单服务模式直接对外提供页面与 API，也可以访问：

```text
http://127.0.0.1:8787
```

后端健康检查地址：

```text
http://127.0.0.1:8787/api/health
```

## 更方便的本地使用方案：安装为桌面应用（无需每次启动服务）

当前版本已经内置 PWA（渐进式网页应用）支持，可以把网页版直接"安装"成一个本地桌面应用。安装后点图标打开，不需要服务器在运行，数据也不会丢失。

**安装步骤（一次性）：**

1. 运行安装脚本，完成后会自动启动服务并打开浏览器：

```bash
cd "MyInternship Progress Tracker"
npm run install:local:linux
```

2. 浏览器打开 `http://127.0.0.1:8787` 后，在地址栏右侧会出现"安装应用"图标（Chrome/Edge 显示为下载或电脑图标），点击安装。

3. 桌面或应用菜单里会出现 MyInternship 图标。

**之后每次使用：**

- 直接点击桌面/应用菜单里的 MyInternship 图标即可打开
- 不需要启动任何服务器，浏览器会从本地缓存加载整个应用
- 没有服务器时自动切换到浏览器本地缓存模式，数据保存在浏览器 localStorage，不会丢失
- 重新打开后仍然能看到之前录入的所有投递记录

如果不想安装 PWA，也可以直接使用 npm run open:local，每次使用前会自动拉起服务并打开浏览器。

## 桌面应用方案

如果你希望它更像真正的软件，而不是“浏览器 + 脚本”，当前项目也已经接入了桌面打包路径。

现在支持：

- 直接本地启动桌面版：在项目目录运行 npm run desktop:start
- 生成未打包桌面产物：npm run desktop:pack
- 生成 Linux AppImage：npm run desktop:dist
- 安装当前仓库里的 Linux 桌面版：npm run desktop:install:linux
- 从 GitHub 最新 Release 下载并安装 Linux 桌面版：npm run desktop:install:release:linux
- 打开已安装桌面版：npm run desktop:open

桌面版特点：

- 会在应用内部自动启动本地 Express + SQLite 服务
- 不再依赖单独手动打开浏览器地址
- 数据默认存到系统用户目录，而不是仓库目录里
- Linux 桌面版的数据固定保存在 ~/.config/MyInternship/data/applications.sqlite
- 关闭应用或卸载桌面启动器后，这份 SQLite 数据不会被自动清空
- 网页页签图标、Electron 窗口图标和 Linux 桌面启动器图标现在统一使用同一份应用 logo

当前优先支持 Linux 桌面环境。

如果你只是想给别人一个“点开就能用”的入口，现在有两条固定链接：

- 直接下载 Linux 桌面版：https://github.com/Jake-yutong/MyInternship/releases/latest/download/MyInternship.AppImage

如果要把“直接打开网页版”也真正打通，还需要在 GitHub 仓库设置里手动完成一次：

- Settings -> Pages -> Build and deployment -> Source 选择 GitHub Actions

## 手动运行与构建

```bash
cd "MyInternship Progress Tracker"
npm install
npm run dev
npm run dev:server
npm run build
```

## 运行前提

- 需要 Node.js 24 或更高版本，因为本地后端使用了内置的 node:sqlite 模块

## 在线部署

可以，当前项目已经支持“一个服务同时提供页面和 API”的部署方式：

- Express 后端会在检测到构建产物后，同时提供前端页面和 /api 接口
- 前端默认请求同源 /api，因此部署成单一网址时不需要额外改前端接口地址
- 推荐部署到支持长期运行 Node 服务和持久磁盘的平台，例如 VPS、Fly.io、Render 或 Railway

关键前提：

- 不能部署到纯静态托管平台，因为 SQLite 需要真实后端进程
- 不能部署到没有持久磁盘的临时文件系统，否则重启或重部署后数据库会丢
- 部署时应把 MyInternship Progress Tracker/server/data 目录挂到持久卷

项目目录里已经加入 Dockerfile，可直接容器化部署。

## 数据说明

- 当前版本默认优先写入本地后端文件，并同步一份浏览器缓存作为兜底
- 不同浏览器、无痕窗口、不同端口或不同域名之间不会共享同一份 localStorage
- 后端运行数据文件位于 MyInternship Progress Tracker/server/data/applications.sqlite
- SQLite 会同时生成运行时辅助文件，例如 applications.sqlite-wal 和 applications.sqlite-shm
- 旧版 JSON 文件若存在，会在后端首次读取时自动迁移到 SQLite
- 当前还没有内置 JSON 导入导出界面；如果后续需要跨设备迁移，建议再补充导入导出能力

## 说明

子项目更完整的开发与使用说明见 MyInternship Progress Tracker/README.md
