# 希尔顿餐厅预订系统 - 前端

基于 SolidJS 构建的餐厅桌位预订系统前端应用。

## 技术栈

- **框架**: SolidJS + TypeScript
- **构建工具**: Vite
- **路由**: @solidjs/router
- **样式**: CSS Modules + 响应式设计
- **测试**: Vitest + @solidjs/testing-library

## 项目结构

```
src/
├── components/          # 可复用组件
├── pages/              # 页面组件
├── contexts/           # React Context (状态管理)
├── services/           # API 服务
├── types/              # TypeScript 类型定义
├── utils/              # 工具函数
├── styles/             # 全局样式
├── routes/             # 路由配置
└── test/               # 测试配置
```

## 快速开始

### 前置要求

- Node.js 18+
- npm 或 yarn
- 后端服务运行在 http://localhost:3000

### 安装依赖

```bash
npm install
```

### 环境配置

#### 1. 复制环境变量文件

```bash
cp .env.example .env
```

#### 2. 配置环境变量

编辑 `.env` 文件，主要配置项：

```bash
# 开发环境配置
NODE_ENV=development

# API配置
VITE_API_BASE_URL=http://localhost:3002/api

# 应用配置
VITE_APP_NAME=希尔顿餐厅预订系统
VITE_APP_VERSION=1.0.0

# 开发配置
VITE_DEV_PORT=5173
VITE_DEV_HOST=localhost

# 调试配置
VITE_DEBUG=true
VITE_LOG_LEVEL=debug
```

#### 3. 本地个人配置（可选）

如需个人化配置，可创建 `.env.local` 文件：

```bash
cp .env.local.example .env.local
```

`.env.local` 文件不会被提交到版本控制，适合存放个人开发配置。

### 启动开发服务器

```bash
npm run dev
```

应用将在 http://localhost:3001 启动

### 构建生产版本

```bash
npm run build
```


### Docker 部署

#### 单独构建前端

```bash
npm run docker:build
npm run docker:run
```

#### 完整系统部署

```bash
npm run docker:compose:build
```

这将启动前端、后端和 MongoDB 服务。

## 功能特性

### 客人功能

- 用户登录/注册
- 创建餐桌预订
- 查看和管理个人预订
- 修改或取消预订

### 员工功能

- 员工登录
- 查看所有预订列表
- 筛选和搜索预订
- 查看预订详情
- 更新预订状态（批准/取消/完成）


## API 集成

前端通过 RESTful API 与后端通信：

- 身份验证: `/api/auth/*`
- 预订管理: `/api/reservations/*`

## 环境变量

### 开发环境

复制 `.env.example` 到 `.env` 并配置：

```bash
cp .env.example .env
```

### 环境变量说明

| 变量名 | 说明 | 默认值 | 必需 |
|--------|------|--------|------|
| `NODE_ENV` | 环境类型 | `development` | 否 |
| `VITE_API_BASE_URL` | 后端 API 地址 | `http://localhost:3002/api` | 是 |
| `VITE_APP_NAME` | 应用名称 | `希尔顿餐厅预订系统` | 否 |
| `VITE_APP_VERSION` | 应用版本 | `1.0.0` | 否 |
| `VITE_DEV_PORT` | 开发服务器端口 | `5173` | 否 |
| `VITE_DEV_HOST` | 开发服务器主机 | `localhost` | 否 |
| `VITE_DEBUG` | 调试模式 | `true` | 否 |
| `VITE_LOG_LEVEL` | 日志级别 | `debug` | 否 |

### 环境文件优先级

1. `.env.local` - 本地个人配置（最高优先级，不提交到版本控制）
2. `.env` - 项目环境配置
3. `.env.example` - 环境配置模板

## 部署

### 生产环境部署

#### 方式 1：Docker Compose（推荐）

```bash
# 构建并启动所有服务
docker-compose up -d --build

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f frontend
```

#### 方式 2：单独部署前端

```bash
# 构建镜像
docker build -t restaurant-frontend .

# 运行容器
docker run -d -p 80:80 --name restaurant-frontend restaurant-frontend
```

#### 方式 3：静态文件部署

```bash
# 构建
npm run build

# 将 dist/ 目录部署到静态文件服务器（如Nginx、Apache等）
```

### 环境变量

生产环境需要配置以下环境变量：

- `VITE_API_BASE_URL`: 后端 API 地址
- `VITE_APP_NAME`: 应用名称
- `VITE_APP_VERSION`: 应用版本

### 健康检查

访问 `/health` 端点检查应用状态。

## 开发规范

- 使用 TypeScript 进行类型检查
- 遵循 SolidJS 最佳实践
- 组件采用函数式编程风格
- 使用 CSS-in-JS 或 CSS Modules



## 页面截图
- 预定管理页面
  <img width="2502" height="1588" alt="image" src="https://github.com/user-attachments/assets/41230bcb-c37a-4b6a-ba82-100b61b27baa" />

- 登录页面
  <img width="742" height="1302" alt="image" src="https://github.com/user-attachments/assets/03f03586-cf3c-42ee-8fa4-0ae627d1b6ab" />

- 注册页面
  <img width="734" height="1708" alt="image" src="https://github.com/user-attachments/assets/a93c4afe-150f-4fbe-ac3b-e04c757861a9" />

- 预定页面
  <img width="1366" height="1676" alt="image" src="https://github.com/user-attachments/assets/0dacd555-6c76-453e-ba6c-5344e94bef3a" />

- 我的预定
  <img width="2440" height="1276" alt="image" src="https://github.com/user-attachments/assets/e03817c7-be89-46fb-8686-14899705e1fa" />

- 预定详情
  <img width="2482" height="1860" alt="image" src="https://github.com/user-attachments/assets/57495262-0ebc-4b22-b360-079fe116c662" />



