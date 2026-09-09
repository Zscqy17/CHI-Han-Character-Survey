# CJK Input Atlas：新版部署说明

版本：v2，2026-09-09。此包包含最新版静态网站、原始论文媒体和 React / TypeScript 源码，保留 241 篇目录、四语显示和匿名审稿临时版本说明。

## 交给 Kimi 的任务

> 下载本仓库最新 Release 中的 `CJK-Input-Atlas-Kimi-deploy.zip` 和 `SHA256SUMS`，校验后解压。把 `site/` 的全部内容部署到中性域名的根目录，免登录访问。保留现有白底黑字学术目录、EN-A 57 / EN-B 184、算法与交互视图，以及英文、中文、日文、韩文切换。展示顺序为 GIF → 视频 → 静态图片；GIF 默认播放，可暂停，并尊重减少动态效果设置。
>
> 保留匿名审稿临时链接说明、noindex、论文署名、图号页码和媒体来源。不要在网站加入个人 GitHub 账号、此仓库的链接、作者机构或邮箱。所有论文保留原文入口，不需要上传完整 PDF 包。无法嵌入的视频保留来源链接；历史失效链接保留状态标记。
>
> `site/` 已包含目录索引，确保首页、`/algorithms/`、`/interaction/` 和 `/papers/<bibkey>/` 可直接访问和刷新；保留同名 `.html` 与 `.rsc` 文件及全部媒体。不要把所有详情页重写为首页。发布后返回实际公开网址及检查结果；匿名审稿地址单独交付，不写回可识别账号的公开仓库。

## 下载

- [最新部署包](https://github.com/Zscqy17/CHI-Han-Character-Survey/releases/latest/download/CJK-Input-Atlas-Kimi-deploy.zip)
- [最新校验文件](https://github.com/Zscqy17/CHI-Han-Character-Survey/releases/latest/download/SHA256SUMS)

```sh
gh release download --repo Zscqy17/CHI-Han-Character-Survey --pattern 'CJK-Input-Atlas-Kimi-deploy.zip' --pattern 'SHA256SUMS' --dir cjk-atlas-download
cd cjk-atlas-download
shasum -a 256 -c SHA256SUMS
unzip CJK-Input-Atlas-Kimi-deploy.zip
```

## 内容与部署设置

| 项目 | 设置 |
| --- | --- |
| 发布目录 | `site/`，映射到域名根目录 `/` |
| 构建命令 | 直接使用 `site/` 时留空 |
| 可维护源码 | `source/` |
| 数据库、密钥、账户系统 | 不需要 |
| PDF 全文 | 本包不包含，网站保留原文入口 |
| HTML 路由 | 已附全部分类和论文详情的目录索引 |
| 搜索引擎 | 保留 noindex 与 robots.txt |

`PACKAGE.json` 记录版本与数量；`FILES.sha256` 记录包内每个文件的 SHA-256。网站媒体包括 2 份 GIF、8 条视频来源，以及每篇论文的配图、表格或明确标记的页面预览。视频来自外部来源，加载需联网；两条已知历史失效来源继续明确标记。

`site/` 使用根目录资源路径。仓库中的 `docs/` 则构建为 `/CHI-Han-Character-Survey` 子目录，供日后 GitHub Pages 使用，不能直接替代根域名部署包。当前不启用个人账号的 GitHub Pages。

## 从源码重建

要求 Node.js 22.13 或更高版本，在 `source/` 内运行：

```sh
npm ci
npm test
npm run typecheck
NEXT_PUBLIC_BASE_PATH='' npm run build:pages
```

发布生成的 `dist/github-pages/`。此命令在空前缀下生成根域名版本及目录索引，无需 Sites 配置或原始论文工作区。

## 核验

本版本的数据、媒体排序、四语完整性、构建、静态路由及本地资源链接已检查。部署者应继续检查正式域名的页面响应、图片/GIF、搜索筛选、语言切换和详情页刷新；未实际执行的浏览器交互检查不得标记为通过。
