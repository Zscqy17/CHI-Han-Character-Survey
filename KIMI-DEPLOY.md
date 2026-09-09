# CJK Input Atlas：Kimi 部署说明

版本：v4。全部 241 篇论文各有一份 GIF：4 份作者动图／视频关键帧、12 份论文图组、225 份原文图页轮播。保留 EN-A 57 / EN-B 184、算法与交互视图、英中日韩四语，以及所有原文入口。

## 交给 Kimi 的任务

> 下载最新 Release 的 `CJK-Input-Atlas-Kimi-deploy.zip` 与 `SHA256SUMS`，校验并解压。把 `site/` 的全部内容部署到中性域名根目录，免登录访问。保留白底黑字目录、四语切换、分类搜索、GIF 优先展示、暂停按钮与按视野加载。静态发布不需要构建、账户、数据库或完整 PDF 包。
>
> 保留论文署名、图号页码、来源与图页轮播说明；轮播帧间隔不是实测输入时间。保留 noindex、robots.txt 和匿名临时浏览说明。不要在网站加入个人 GitHub 账号、此仓库链接、综述作者机构或邮箱。匿名审稿网址单独交付，不写入可识别账号的公开仓库。
>
> 保留全部目录索引、`.html`、`.rsc` 和媒体文件。检查首页、`/algorithms/`、`/interaction/` 及所有 `/papers/<bibkey>/` 的直接访问与刷新；不要把详情页重写为首页。发布后返回真实网址与检查结果。外部视频不能播放时保留其来源和状态。

## 下载

- [最新部署包](https://github.com/Zscqy17/CHI-Han-Character-Survey/releases/latest/download/CJK-Input-Atlas-Kimi-deploy.zip)
- [SHA-256 校验文件](https://github.com/Zscqy17/CHI-Han-Character-Survey/releases/latest/download/SHA256SUMS)

```sh
gh release download --repo Zscqy17/CHI-Han-Character-Survey --pattern 'CJK-Input-Atlas-Kimi-deploy.zip' --pattern 'SHA256SUMS' --dir cjk-atlas-download
cd cjk-atlas-download
shasum -a 256 -c SHA256SUMS
unzip CJK-Input-Atlas-Kimi-deploy.zip
```

## 内容

- `site/`：可直接部署的根域名静态网站，包括全部 241 份 GIF。
- `source/`：可维护 React / TypeScript 源码。媒体共用 `site/media/`，压缩包不重复存储。
- `restore-source-media.mjs`：重建源码前，将共享媒体恢复到源码目录。
- `PACKAGE.json` 与 `FILES.sha256`：版本、数量及全部文件校验。
- `site/data/gif-coverage.json`：241 篇逐项 GIF 覆盖清单。
- `site/data/gif-validation.json`：全部 GIF 解码及新增原文页面像素核验记录。

本包不含全文 PDF。新增图页 GIF 共 1,126 帧，包括 225 个已选源图／表／预览及 901 张原文页面。整页展示保留独立裁切边界不确定的子图和标注；这不表示每一幅图都已单独裁出。14 条外部视频来源保留原有状态。

## 从源码重建

要求 Node.js 22.13 或更高版本。先恢复共享媒体，再构建：

```sh
cd source
node ../restore-source-media.mjs
npm ci
npm test
npm run typecheck
NEXT_PUBLIC_BASE_PATH='' npm run build:pages
```

发布 `source/dist/github-pages/`。直接发布现成 `site/` 时无需以上步骤。仓库中的 `docs/` 使用 `/CHI-Han-Character-Survey` 子目录路径，不能直接替代根域名部署包。当前不启用个人 GitHub Pages。

## 核验边界

数据、分类覆盖、GIF 解码、源图哈希、901 张页面的逐像素一致性、构建与静态资源链接已核验。部署者仍须检查实际域名上的播放、搜索筛选、四语切换和详情页刷新；未执行的浏览器交互测试不得标记为通过。
