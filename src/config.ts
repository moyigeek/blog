export const SITE = {
  title: "MoyiGeek's Blog",
  subtitle: 'a deep dive into the world of technology',
  author: 'moyigeek',
  description: '技术博客 - Rust, C++, 操作系统, 网络安全, AI',
  url: 'https://blog.moyihust.eu.org',
  lang: 'zh-CN',
  locale: 'zh_CN',
  startYear: 2024,
  startDate: '2024/11/12 11:40:14',
  social: {
    github: 'https://github.com/moyigeek',
    email: 'futuremarx@foxmail.com',
  },
  nav: [
    { label: '首页', path: '/' },
    { label: '归档', path: '/archives' },
    { label: '标签', path: '/tags' },
    { label: '相册', path: '/gallery' },
    { label: '关于', path: '/about' },
  ],
} as const;

export const GISCUS_CONFIG = {
  repo: 'moyigeek/blog',
  repoId: 'R_kgDONN6nBQ',
  category: 'Announcements',
  categoryId: 'DIC_kwDONN6nBc4Ckk43',
  mapping: 'pathname',
  strict: '0',
  reactionsEnabled: '1',
  emitMetadata: '0',
  lang: 'zh-CN',
  inputPosition: 'bottom',
  loading: 'lazy',
} as const;
