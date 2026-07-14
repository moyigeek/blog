# MoyiGeek's Blog

基于 Astro 构建的个人技术博客。

## 技术栈

- **框架**: Astro 5
- **样式**: Tailwind CSS + Typography
- **评论**: Giscus (GitHub Discussions)
- **部署**: Cloudflare Pages

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

## 项目结构

```
src/
├── components/     # 可复用组件
├── content/posts/  # Markdown 文章
├── data/           # 数据文件（相册等）
├── layouts/        # 页面布局
├── pages/          # 页面路由
├── styles/         # 全局样式
└── utils/          # 工具函数
public/             # 静态资源（图片等）
```

## 功能

- 文章列表（分页）
- 归档（按年份分组）
- 标签系统（标签云 + 按标签筛选）
- 相册（瀑布流 + 灯箱）
- 暗黑模式
- RSS 订阅
- 站点地图
- Giscus 评论

## Cloudflare Pages 部署

### 方式一：GitHub Actions 自动部署（推荐）

1. 在 Cloudflare Dashboard 创建 Pages 项目，名称为 `moyigeek-blog`
2. 在 GitHub 仓库 Settings → Secrets 添加：
   - `CLOUDFLARE_API_TOKEN` - Cloudflare API Token（需要 Pages 编辑权限）
   - `CLOUDFLARE_ACCOUNT_ID` - Cloudflare Account ID
3. 推送代码到 `main` 分支即可自动部署

### 方式二：Cloudflare Pages Git 集成

1. 在 Cloudflare Dashboard → Pages → Create a project → Connect to Git
2. 选择仓库，配置：
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Environment variable**: `NODE_VERSION = 22`
3. 保存后每次 push 自动触发部署

## 写作

新建文章：在 `src/content/posts/` 下创建 Markdown 文件

```markdown
---
title: 文章标题
date: 2024-01-01 12:00:00
tags:
  - 标签1
  - 标签2
description: 文章描述（可选）
---

正文内容...
```
