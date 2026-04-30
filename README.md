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
- 本地前端开发地址：http://127.0.0.1:5173
- 本地单服务访问地址：http://127.0.0.1:8787
- 本地健康检查地址：http://127.0.0.1:8787/api/health

说明：

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

## 更方便的本地使用方案

如果只是你自己长期在本机使用，最省事的方案不是每次手动运行启动脚本，而是“安装一次，之后点图标打开”：

- 一次性执行：在 MyInternship Progress Tracker 目录运行 npm run install:local:linux
- 这个安装过程会自动安装依赖、构建前端、注册本地 systemd 用户服务，并创建桌面启动器
- 安装完成后，后续只需要点击应用菜单里的 MyInternship，或者运行 npm run open:local
- 如果本地服务未运行，启动器会自动拉起服务并打开浏览器到 http://127.0.0.1:8787

这个方案适用于当前 Linux 环境，且能保留现有 SQLite 后端思路。

## 桌面应用方案

如果你希望它更像真正的软件，而不是“浏览器 + 脚本”，当前项目也已经接入了桌面打包路径。

现在支持：

- 直接本地启动桌面版：在项目目录运行 npm run desktop:start
- 生成未打包桌面产物：npm run desktop:pack
- 生成 Linux AppImage：npm run desktop:dist

桌面版特点：

- 会在应用内部自动启动本地 Express + SQLite 服务
- 不再依赖单独手动打开浏览器地址
- 数据默认存到系统用户目录，而不是仓库目录里

当前优先支持 Linux 桌面环境。

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
