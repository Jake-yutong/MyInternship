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

后端健康检查地址：

```text
http://127.0.0.1:8787/api/health
```

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

## 数据说明

- 当前版本默认优先写入本地后端文件，并同步一份浏览器缓存作为兜底
- 不同浏览器、无痕窗口、不同端口或不同域名之间不会共享同一份 localStorage
- 后端运行数据文件位于 MyInternship Progress Tracker/server/data/applications.sqlite
- SQLite 会同时生成运行时辅助文件，例如 applications.sqlite-wal 和 applications.sqlite-shm
- 旧版 JSON 文件若存在，会在后端首次读取时自动迁移到 SQLite
- 当前还没有内置 JSON 导入导出界面；如果后续需要跨设备迁移，建议再补充导入导出能力

## 说明

子项目更完整的开发与使用说明见 MyInternship Progress Tracker/README.md
