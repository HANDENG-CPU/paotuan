# 轮回者大街 - 桌面角色扮演游戏平台

一个现代化的桌面角色扮演游戏平台，支持会话管理、角色创建、战役管理、地图编辑、规则书和抽卡系统。

## 🚀 快速开始

### 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### Vercel 部署

#### 方法1: 使用 Vercel CLI

```bash
# 安装 Vercel CLI
npm install -g vercel

# 登录 Vercel
vercel login

# 部署项目
vercel

# 生产环境部署
vercel --prod
```

#### 方法2: 使用 GitHub 集成

1. 将代码推送到 GitHub 仓库
2. 访问 [vercel.com](https://vercel.com)
3. 点击 "New Project"
4. 导入你的 GitHub 仓库
5. 选择框架为 "Vite"
6. 点击 "Deploy"

## 📁 项目结构

```
src/
├── components/          # React 组件
│   ├── auth/           # 认证相关
│   ├── campaign/       # 战役管理
│   ├── character/      # 角色管理
│   ├── dashboard/      # 仪表板
│   ├── gacha/          # 抽卡系统
│   ├── map/            # 地图编辑器
│   ├── rules/          # 规则书
│   └── session/        # 会话管理
├── types/              # TypeScript 类型定义
├── utils/              # 工具函数
└── App.tsx             # 主应用组件
```

## 🎮 功能特性

### 核心功能
- ✅ **会话管理**: 创建、加入、管理游戏会话
- ✅ **角色管理**: 创建和管理角色卡
- ✅ **战役管理**: 长期战役的创建和管理
- ✅ **地图编辑器**: 可视化地图编辑
- ✅ **规则书系统**: 游戏规则和模组管理
- ✅ **抽卡系统**: 随机事件和奖励系统

### 协作功能
- ✅ **房间码系统**: 通过6位数字码加入房间
- ✅ **实时聊天**: 会话内实时通信
- ✅ **骰子系统**: 在线骰子投掷
- ✅ **文件上传**: 支持图片和文档上传
- ✅ **数据同步**: 本地存储数据同步

### 用户体验
- ✅ **响应式设计**: 支持桌面和移动设备
- ✅ **黑白主题**: 简约现代的UI设计
- ✅ **错误处理**: 统一的错误提示系统
- ✅ **加载状态**: 友好的加载提示
- ✅ **数据导出**: 支持数据备份和恢复

## 🛠️ 技术栈

- **前端框架**: React 18 + TypeScript
- **构建工具**: Vite
- **路由**: React Router DOM
- **UI组件**: Lucide React (图标)
- **样式**: CSS3 + 响应式设计
- **数据存储**: LocalStorage
- **部署**: Vercel

## 📱 浏览器支持

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🔧 开发命令

```bash
# 开发模式
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview

# 代码检查
npm run lint
```

## 🌐 部署说明

### Vercel 部署配置

项目已配置 `vercel.json` 文件，包含：

- **构建命令**: `npm run build`
- **输出目录**: `dist`
- **框架**: Vite
- **路由重写**: 支持 SPA 路由
- **缓存策略**: 静态资源优化

### 环境变量

如需配置环境变量，可在 Vercel 项目设置中添加：

```env
# 示例环境变量
VITE_APP_TITLE=轮回者大街
VITE_APP_VERSION=1.0.0
```

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

**轮回者大街** - 让桌面角色扮演游戏更加便捷和有趣！🎲✨ 