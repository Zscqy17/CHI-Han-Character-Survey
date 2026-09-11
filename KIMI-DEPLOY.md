# CJK Input Atlas — Kimi deployment (v7)

Download the latest deployment ZIP and SHA256SUMS below. Verify the checksum, extract the ZIP, and deploy **only the complete contents of `CJK-Input-Atlas-Kimi/site/`** at the root of a neutral temporary domain. This is a prebuilt static website; no installation, build, database, login or PDF upload is required.

- [Deployment ZIP](https://github.com/Zscqy17/CHI-Han-Character-Survey/releases/latest/download/CJK-Input-Atlas-Kimi-deploy.zip)
- [SHA256SUMS](https://github.com/Zscqy17/CHI-Han-Character-Survey/releases/latest/download/SHA256SUMS)

Preserve HTML, RSC, JavaScript, CSS, media, robots.txt and directory indexes. Test `/`, `/algorithms/`, `/interaction/`, and direct opening/refreshing of `/papers/<bibkey>/`. Do not replace all paper URLs with the homepage.

v7 displays the computational category `na` as **NA**. The five review-aligned filter dimensions, 43 categories, 241 paper records, 241 GIFs, original-source links, and English/Chinese/Japanese/Korean display languages are retained. Media use the verified delivery encodings from the current offline supplement: original dimensions, lossless PNG-to-WebP and GIF optimization, and light near-lossless compression for selected static images. Paper slideshows remain labeled as editorial presentations.

Keep noindex and robots.txt. Return the temporary review URL privately; do not put it in this identifiable repository or add repository/account identity to the review site. GitHub Pages remains disabled. Confirm search, filters, all four display languages, GIF play/pause and local image links after deployment.

The repository's `website/` directory contains the maintained source with original media. The deployment ZIP contains the prebuilt site, not a second source copy. The obsolete `docs/` snapshot has been removed.

The earlier [compressed 241-paper PDF archive](https://github.com/Zscqy17/CHI-Han-Character-Survey/releases/download/cjk-input-atlas-kimi-v6/CJK-Input-Atlas-pdfs-small.zip) remains a separate optional download and is not needed for hosting.

## 给 Kimi 的简短指令

请下载最新 Deployment ZIP，校验 SHA256SUMS，解压并把 `CJK-Input-Atlas-Kimi/site/` 的内容部署到中性的临时域名根目录。保留全部文件与路径，不需要重新构建。检查首页、算法页、交互页、论文详情、搜索筛选、四语切换及 GIF。保持禁止搜索引擎索引；部署成功后私下返回访问链接，不要把匿名审稿地址写入 GitHub。
