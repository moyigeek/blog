# Blog Project Memory

## Project Overview
- Personal blog for moyigeek (moyihust)
- Originally Hexo + hexo-theme-redefine, refactored to Astro 5 on 2025-07-15
- Deployed via Cloudflare Pages

## Tech Stack
- **Framework**: Astro 5 (static output)
- **Styling**: Tailwind CSS 3 + @tailwindcss/typography
- **Comments**: Giscus (GitHub Discussions, repo: moyigeek/blog)
- **Deployment**: Cloudflare Pages (GitHub Actions CI)
- **Node**: 22.x

## Site Config
- URL: https://blog.moyihust.eu.org
- Author: moyigeek
- Email: futuremarx@foxmail.com
- GitHub: https://github.com/moyigeek
- Site start date: 2024/11/12

## Content
- 21 blog posts in `src/content/posts/` (Markdown)
- Post front-matter: title, date, tags (array), description (optional)
- Gallery photos in `src/data/gallery.ts` (8 items)
- Post images in `public/images/posts/<slug>/`
- Gallery/site images in `public/images/`
- Background images in `public/background/`

## Key Architecture Decisions
- Pagination: `index.astro` for page 1, `[page].astro` for pages 2+ (Astro's `paginate()` had issues generating first page at `/`)
- Tag slugs: `slugifyTag()` utility handles special chars (colons, slashes) in tag names like `author:moyigeek`
- Tags schema: `z.array(z.string()).nullish().transform(v => v ?? [])` to handle null tags in some posts
- Theme: CSS variables for light/dark mode, toggle via class on `<html>`

## CI/CD
- `.github/workflows/deploy.yml` - builds and deploys to Cloudflare Pages on push to main
- Requires secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`
- Build command: `npm run build`, output: `dist/`

## Known Issues (non-blocking)
- Shiki warnings for code language names are resolved (C→c, RUST→rust, pyhton→python)
- CSS minify warning `-3: -4` from Tailwind Typography plugin (harmless)
- Some posts have broken local image refs (`file:///D:/...`) replaced with HTML comments
