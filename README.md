# CJK Input Atlas — Kimi deployment handoff

This repository provides the completed CJK Input Atlas website for deployment with Kimi. The package contains the static HTML site, original-paper images and GIFs, curated data, and maintainable React / TypeScript source.

## 下载 / Download

- [部署包 / Deployment ZIP (64.4 MB)](https://github.com/Zscqy17/CHI-Han-Character-Survey/releases/download/cjk-input-atlas-kimi-v1/CJK-Input-Atlas-Kimi-deploy.zip)
- [Release 页面 / Release page](https://github.com/Zscqy17/CHI-Han-Character-Survey/releases/tag/cjk-input-atlas-kimi-v1)
- [完整部署说明 / Deployment instructions](KIMI-DEPLOY.md)
- [SHA-256 校验 / Checksum](SHA256SUMS)

部署包作为 Release 附件提供，不在 Git 源码压缩包中。仓库访问权限同样适用于 Release 附件：如果仓库保持私有，Kimi 的下载环境必须已获授权；普通匿名下载链接无法绕过私有权限。

The deployment ZIP is a release asset, not part of GitHub's automatically generated source archive. Repository permissions also apply to release assets; a private repository requires an authorized downloader.

## 交给 Kimi 的任务 / Task for Kimi

> 下载本仓库 Release `cjk-input-atlas-kimi-v1` 中的 `CJK-Input-Atlas-Kimi-deploy.zip`，校验 SHA-256，解压后阅读 `KIMI-DEPLOY.md`。将 `site/` 直接部署为网站根目录，按说明配置无扩展名详情页路由；`source/` 是可维护源码，需要适配时再重建。保留全部 241 篇记录、EN-A 57 / EN-B 184、算法与交互视图、英中日韩四语、白底黑字和图片优先的现有界面。发布为免登录的匿名网站，保留 noindex，检查页面、图片/GIF、语言切换、搜索与筛选，并返回正式公开网址。如果当前环境需要我点击「发布」，准备好网站后指出具体位置。

> Download `CJK-Input-Atlas-Kimi-deploy.zip` from release `cjk-input-atlas-kimi-v1`, verify its SHA-256, and follow the included `KIMI-DEPLOY.md`. Publish `site/` at the origin root with the documented clean-URL routing. Preserve the existing catalogue, classifications, four display languages, media, citations and academic layout. Return a production URL and actual validation results.

已在终端授权 GitHub 的 Kimi 环境也可以使用：

```sh
gh release download cjk-input-atlas-kimi-v1 --repo Zscqy17/CHI-Han-Character-Survey --pattern 'CJK-Input-Atlas-Kimi-deploy.zip' --pattern 'SHA256SUMS' --dir cjk-atlas-download
cd cjk-atlas-download
shasum -a 256 -c SHA256SUMS
unzip CJK-Input-Atlas-Kimi-deploy.zip
```

This command works in a Kimi terminal with authorized GitHub access. Public repositories can also use the direct download link.

## 内容 / Contents

- 241 papers: EN-A 57; EN-B 184.
- Algorithms: 110; Interaction: 181; overlap: 50.
- English, Chinese, Japanese and Korean display languages; default English.
- 245 static HTML files, including 241 paper records and a 404 page.
- Original illustrations, tables or explicitly labeled page previews for every record, with citations and provenance.
- No database, account system or deployment credentials required by the static site.

本仓库交付网站部署包；含 241 篇 PDF 的投稿补充材料另行交付。公开网站保留全部论文的原文入口。

This handoff contains the website deployment package. The submission supplement containing all 241 PDFs is delivered separately; the website retains original-source links for every paper.

Kimi 官方入口 / Official entry: https://www.kimi.com/agent
