---
title: 如何查询repo_id和category_id
date: 2024-11-25 13:55:30
tags:
- GitHub
---

## 如何查询repo_id和category_id
在配置基于 Github Discussions的博客评论系统时(例如aiscus)，往往需要获取repo的repoId、cateqoryId 等属性，因此这里介绍一种获
这些信息的方法。

首先需要开启仓库的 Discussions 功能。在仓库的 Settings -> Options -> Features 中找到 Discussions 并开启。

访问[Github Docs Explorer](https://docs.github.com/en/graphql/overview/explorer), 在左侧的文本框中输入以下代码：

记得修改userName和repoName为你的用户名和仓库名。
```graphql
{
  repository(owner: "userName", name: "repoName") {
    id
    discussionCategories (first: 5) {
      nodes {
        name
        id
      }
    }
  }
}
```
即可在右侧看到返回的数据，其中`id`即为`repo_id`，`discussionCategories`中的`id`即为`category_id`。