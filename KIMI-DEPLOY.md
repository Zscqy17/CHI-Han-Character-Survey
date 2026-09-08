# CJK Input Atlas：交给 Kimi 的部署说明

交付日期：2026-09-08。目标是迁移已经完成的网站，发布一个审稿人可以免登录访问的正式网址。

## 用户如何交接

1. 打开 [Kimi Agent](https://www.kimi.com/agent)，进入网站 / Websites 功能。
2. 上传 `CJK-Input-Atlas-Kimi-deploy.zip`，发送下面的任务文字。如果使用能访问本机文件的 Kimi，直接让它读取本地压缩包即可；网页端 Kimi 不能凭本机路径获取文件。
3. 按 Kimi 的部署流程完成发布。官方说明区分预览与公网发布，当前文档写明需要点击「发布」。完成后保存正式网址，并用退出登录的浏览器和手机网络检查。

官方入口与说明：[Agent 介绍](https://www.kimi.com/help/agent/agent-overview)、[网站发布与部署说明](https://www.kimi.com/help/websites/websites-why-not-working)。功能和按钮以 Kimi 当前界面为准。

## 可直接复制给 Kimi

> 请部署附件中的 CJK Input Atlas 现有网站。先解压并阅读根目录 KIMI-DEPLOY.md 和 PACKAGE.json。优先使用 site/ 内已经构建好的静态网站，直接部署到域名根目录；source/ 是可维护源码，仅在托管适配或修改确有需要时重建。
>
> 保持现有白底黑字、图片优先的学术目录，以及全部 241 篇记录、EN-A 57 / EN-B 184、算法 / 交互两个视图和英中日韩四语切换。保留论文原文链接、图片/GIF、图号页码及来源说明、综述对应的算法阶段和交互方式分类。
>
> 请配置无扩展名详情路由：/algorithms 对应 algorithms.html，/interaction 对应 interaction.html，/papers/<bibkey> 对应 papers/<bibkey>.html。保留所有静态资源和 .rsc 文件；不存在的页面返回 404。根据下方路由规则适配当前托管环境，避免把所有详情页都返回首页。
>
> 使用 Kimi 当前提供的网站发布能力，部署为匿名、免登录的公开网站，保留 noindex。网站不需要数据库、账户、上传功能或 OpenAI Sites 配置。原有网址无法供我访问，请从附件部署，不依赖旧网址下载资源。如果当前环境必须由我点击「发布」，先准备好可发布版本，再明确告诉我需要点击的位置。不要将本地地址、沙盒预览或任务分享页当成正式部署结果。
>
> 发布后检查首页、算法页、交互页、论文详情页直接访问和刷新、图片/GIF、四语切换、搜索及筛选，并交付正式网址、部署位置、维护方式和实际核验结果。网址与公开内容不能暴露本综述作者的身份；被收录论文的正常署名和来源必须保留。新网址在我的网络上能否打开，还需要我实际确认。

## 包内结构

```text
CJK-Input-Atlas-Kimi/
  KIMI-DEPLOY.md    本说明
  PACKAGE.json     文件统计与部署参数
  SHA256SUMS       包内文件完整性校验
  site/            已完成构建，可直接托管
    index.html
    algorithms.html
    interaction.html
    404.html
    papers/        241 个论文详情 HTML，及配套 .rsc 文件
    _next/         JavaScript、CSS 等构建资源
    media/         原始论文配图、GIF 及海报
    data/          公开目录、分类和来源记录
    robots.txt
    _headers
  source/          React / TypeScript 完整源码及锁文件
```

`site/papers/` 放的是论文详情网页。241 篇 PDF 全文及离线 HTML 在另一个文件 `CJK-Input-Atlas-supplement.zip`，用于投稿补充材料。部署网站使用本包即可，全部论文仍通过来源链接进入原文。

## 首选：直接部署静态文件

| 设置 | 值 |
| --- | --- |
| 网站类型 | 静态 HTML / CSS / JavaScript |
| 发布目录 | 解压后的 `site/` |
| 构建命令 | 留空，静态文件已经构建完成 |
| 入口 | `site/index.html` 映射到 `/` |
| 公开访问 | HTTPS，访问者免登录 |
| 数据库 / API / 环境密钥 | 不需要 |
| 搜索引擎 | 保留 HTML 中的 noindex 和 robots.txt |

必须把 `site/` 的内容部署为网站根目录，不能把整个解压目录当作公开根目录。源码与本说明无需公开托管。

资产路径采用 `/_next/…`、`/media/…`、`/data/…`，因此默认部署到域名根目录。若平台只能使用网址子目录，需要在源码中同步调整路由与资源路径并重新构建，再验证全部链接。

### 静态路由规则

按以下顺序解析请求，查询参数不影响磁盘文件选择：

1. `/` 返回 `index.html`。
2. 实际存在的文件直接返回，包括 `.js`、`.css`、`.rsc`、图片、GIF 和数据文件。
3. 无扩展名路径 `/algorithms`、`/interaction`、`/papers/<bibkey>`，查找同名 `.html`。也接受这些路径的末尾 `/`。
4. 其他不存在的路径返回 `404.html`，HTTP 状态为 404。

不要统一重写为首页。若平台只能通过目录索引实现干净网址，可以额外生成 `algorithms/index.html`、`interaction/index.html` 与 `papers/<bibkey>/index.html`，保留原来的 `.html` 和 `.rsc` 文件；上线后核验详情页刷新与站内切换。

按文件类型返回正确 MIME，尤其是 JavaScript、CSS、JSON、SVG、PNG 和 GIF。`.rsc` 使用 `text/x-component`。若平台支持响应头，将 `_headers` 中的规则应用到全站；不支持该文件格式时保留 HTML 中已有的 robots 元信息，并在平台配置中设置等效响应头。

## 备选：从源码重新构建

只有需要修改或托管适配时才执行。源码使用 React / TypeScript、Vinext 和 Vite，已经带有完整公开数据与媒体，不需要获取原稿工作区。

要求 Node.js 22.13.0 或更新版本。在 `source/` 内依次执行：

```sh
npm ci
npm run test
npm run typecheck
npm run build
```

构建产物位于 **`source/dist/client/`**。部署这个目录，使用上面的静态路由规则。不要误用 `dist/`、`dist/server/`、`out/` 或源代码目录。

源码的 `npm start` 是原托管环境的开发入口，不用于本次静态部署。无需执行数据采集、PDF 打包或离线构建脚本。`data/papers.json` 已是完成整理的数据源。

交付源码未包含 `.openai/hosting.json`、Git 历史或部署凭据。Vite 配置只在本地存在该文件时启用 Sites 插件，本包不会启用它。直接部署 `site/` 不需要安装任何 Node 依赖。

## 发布后检查

- 正式网址免登录可访问，网址不含个人姓名、机构或私人仓库名；确认发布状态，不只确认预览。
- `/`、`/algorithms?lang=en`、`/interaction?lang=zh` 均可直接打开与刷新。
- `/papers/ezaki2000pen?lang=ja` 与 `/papers/huang2004statistical?lang=ko` 可直接打开，图片正确，详情不是首页。
- 默认英文；中文、日文、韩文切换生效；原始论文标题和署名保留。
- 全部 241 条记录；EN-A 57、EN-B 184；算法 110、交互 181，两视图重叠 50 篇。
- 每篇有图、表或明确标注的页面预览；本地图像与 GIF 正常加载；外部视频仍按需访问来源，不把来源失效误判为整个网站失效。
- 标题搜索、算法阶段、交互方式、语言、发表渠道与图片/视频筛选可组合使用。
- 保留 noindex、原始出处与图号/页码；不加入综述作者身份信息。
- Kimi 报告实际检查结果；用户另用自己的网络确认访问。尚未验证的网络或功能明确记为未验证。

截至本包交付，新的 Kimi 正式网址尚未生成。实际发布网址由 Kimi 发布后返回。
