# MyInternship

MyInternship，中文名“麦恩忒诗”，是一个以本地优先为核心的个人实习投递追踪应用。当前版本基于 React + Vite，支持卡片视图与甘特图视图，并把投递记录持久化到浏览器本地存储中，适合个人在本机长期维护求职进度。

## 当前能力

- 卡片视图管理投递记录，支持新增、编辑、删除
- 甘特图视图按阶段日期展示投递时间线
- 本地持久化保存，关闭浏览器后数据仍会保留
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
- 固定以 127.0.0.1:5173 启动开发服务器
- 尽量保持 localStorage 的同源地址稳定，避免因为开发地址变化导致“看起来像丢数据”

启动后访问：

```text
http://127.0.0.1:5173
```

## 手动运行与构建

```bash
cd "MyInternship Progress Tracker"
npm install
npm run dev
npm run build
```

## 数据说明

- 当前版本没有后端，数据只保存在你本机当前浏览器配置文件中
- 不同浏览器、无痕窗口、不同端口或不同域名之间不会共享同一份 localStorage
- 当前还没有内置 JSON 导入导出界面；如果后续需要跨设备迁移，建议再补充导入导出能力

## 说明

子项目更完整的开发与使用说明见 MyInternship Progress Tracker/README.md
