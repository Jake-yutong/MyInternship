
# MyInternship Progress Tracker

MyInternship Progress Tracker 是“麦恩忒诗”应用的前端实现。这个目录最初来源于 Figma 导出的代码包，现已扩展为一个可实际使用的本地化实习投递追踪工具。

原始设计链接：
https://www.figma.com/design/uMmWLsstRjQ8E3DrRprJ3Z/MyInternship-Progress-Tracker

## 技术栈

- React 18
- Vite 6
- TypeScript
- Tailwind CSS 4

## 已实现功能

### 1. 投递记录管理

- 新增、编辑、删除投递卡片
- 字段覆盖公司、岗位、状态、日期、JD、备注、Logo 等信息
- 首次打开时若没有历史数据，会自动注入示例记录

### 2. 视图切换

- 左侧导航支持在卡片视图和甘特图视图间切换
- 甘特图会根据每条记录中的日期字段动态生成时间段展示

### 3. 本地持久化

- 所有记录保存在浏览器 localStorage 中
- 存储结构使用稳定 key，而不是和版本强耦合的 key
- 存储内容包含 schemaVersion，支持后续迁移
- 同时写入备份 key，用于主数据异常时恢复
- 兼容旧 key 的历史数据读取与迁移

### 4. 智能输入增强

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

推荐固定使用这个地址，是因为 localStorage 按“协议 + 域名 + 端口”隔离。开发时如果端口频繁变化，会导致你看到的是另一份本地存储。

启动后访问：

```text
http://127.0.0.1:5173
```

## 手动命令

```bash
npm install
npm run dev
npm run build
```

## 可用脚本

- npm run dev: 启动 Vite 开发服务器
- npm run build: 生成生产构建
- npm run start:local: 一键本地启动，自动安装依赖并固定地址

## 数据持久化说明

当前实现是“纯本地、单用户、单浏览器配置”模型：

- 数据只存在当前浏览器的 localStorage
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
    data.ts                应用数据模型、状态配置、迁移与存储解析
    hooks/
      useLocalStorage.ts   本地存储 Hook
    components/
      CardView.tsx         卡片视图
      GanttView.tsx        甘特图视图
      SlideOutPanel.tsx    新增/编辑面板
      DeleteModal.tsx      删除确认弹窗
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
  