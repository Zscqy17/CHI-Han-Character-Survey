# CJK Input Atlas

241 篇中日韩文字输入研究的在线目录及配套媒体。保留 EN-A / EN-B、算法与交互视图，以及英中日韩四种显示语言。

## 最新版下载 / Latest download

- [网站部署包 / Deployment ZIP](https://github.com/Zscqy17/CHI-Han-Character-Survey/releases/latest/download/CJK-Input-Atlas-Kimi-deploy.zip)
- [版本说明 / Release](https://github.com/Zscqy17/CHI-Han-Character-Survey/releases/latest)
- [校验文件 / SHA-256](SHA256SUMS)
- [交给 Kimi 的部署说明 / Deployment instructions](KIMI-DEPLOY.md)

新版含 **241 份 GIF，每篇论文一份**：4 份作者动图／视频关键帧、12 份图组轮播、225 份原文图页轮播。保留英中日韩四语说明、原文入口和逐帧出处。图页轮播明确标注为编辑展示。

新版优先展示 **视频截帧／作者 GIF → 论文图组 GIF → 原文图页 GIF → 视频 → 静态图片**。GIF 在进入视野附近时加载播放，可暂停，滚出视野后显示静态预览；视频按需加载，不能嵌入时提供来源入口。白底黑字，保留原始论文署名、图号页码和出处。

The latest version puts animated GIFs first, video sources second, and static images third. GIFs have a pause control and respect reduced-motion preferences. External video players load on request; source-only and unavailable records keep their status labels.

## 匿名审稿 / Anonymous review

为满足匿名审稿要求，网站通过单独提供的临时链接浏览。当前不启用个人账号的 GitHub Pages，也不在此可识别账号的公开仓库中披露临时审稿地址。读者无需下载完整 PDF 包。

The review site uses a temporary link supplied separately. GitHub Pages under this account remains disabled, and the temporary review address is not disclosed here. Source papers retain their original authorship and media attribution.

## 内容 / Collection

- 241 papers: EN-A 57; EN-B 184.
- Algorithms: 110; Interaction: 181; overlap: 50.
- Chinese: 155; Japanese: 67; Korean: 13; cross-script/general: 6.
- English, Chinese, Japanese and Korean display languages; default English.
- Every paper has an original-source link and an attributed illustration, table or labeled page preview.
- No database, login service or full-text PDF directory is needed for online hosting.

## 源码与维护 / Source and maintenance

`website/` contains the maintained React / TypeScript source and curated public data. `docs/` contains a static export configured for the `/CHI-Han-Character-Survey` project path, reserved for later GitHub Pages use. The release ZIP's `site/` is configured for deployment at a domain root and includes all directory indexes. ZIP media are stored once in `site/media/`; run the included `restore-source-media.mjs` before rebuilding its `source/` copy. The `website/` source in this repository already includes its media.

Requires Node.js 22.13 or later:

```sh
cd website
npm ci
npm test
npm run typecheck
NEXT_PUBLIC_BASE_PATH='' npm run build:pages
```

Deploy `website/dist/github-pages/` at the domain root. For later GitHub Pages use, `npm run build:pages` defaults to the repository path; see [GITHUB-PAGES.md](GITHUB-PAGES.md). Build commands do not enable publishing or change access settings.

The [v1 release](https://github.com/Zscqy17/CHI-Han-Character-Survey/releases/tag/cjk-input-atlas-kimi-v1) remains available as a historical snapshot. New deployments should use the latest release.
